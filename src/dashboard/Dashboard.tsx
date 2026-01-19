import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAtom } from "jotai";
import { getActiveSetTracks } from "../shared/utils/setUtils.ts";
import { useIPCSend, useIPCInvoke } from "./core/hooks/useIPC.ts";
import { useLatestRef } from "./core/hooks/useLatestRef.ts";
import {
  userDataAtom,
  recordingDataAtom,
  activeTrackIdAtom,
  activeSetIdAtom,
  selectedChannelAtom,
  flashingConstructorsAtom,
  recordingStateAtom,
  useFlashingChannels,
} from "./core/state.ts";
import { DashboardHeader } from "./components/DashboardHeader.tsx";
import { DashboardFooter } from "./components/DashboardFooter.tsx";
import { DashboardBody } from "./components/DashboardBody.tsx";
import { DashboardModalLayer } from "./components/DashboardModalLayer.tsx";
import { WorkspaceGateModal } from "./components/WorkspaceGateModal.tsx";
import { useWorkspaceModules } from "./core/hooks/useWorkspaceModules.ts";
import { useInputEvents } from "./core/hooks/useInputEvents.ts";
import { useModuleIntrospection } from "./core/hooks/useModuleIntrospection.ts";
import { useProjectorPerfStats } from "./core/hooks/useProjectorPerfStats.ts";
import { useDashboardPlayback } from "./core/hooks/useDashboardPlayback.ts";
import { useDashboardBootstrap } from "./core/hooks/useDashboardBootstrap.ts";
import { useDashboardPersistence } from "./core/hooks/useDashboardPersistence.ts";
import { useDashboardUiState } from "./core/hooks/useDashboardUiState.ts";
import { useDashboardProjectorSettings } from "./core/hooks/useDashboardProjectorSettings.ts";
import { useDashboardInputConfiguration } from "./core/hooks/useDashboardInputConfiguration.ts";
import { useWorkspaceModuleIntrospectionDrain } from "./core/hooks/useWorkspaceModuleIntrospectionDrain.ts";
import { useDashboardUpdateConfig } from "./core/hooks/useDashboardUpdateConfig.ts";

import "../rendererPolyfills";
import "../shared/styles/_main.css";

const Dashboard = () => {
  const [userData, setUserData] = useAtom(userDataAtom);
  const [recordingData, setRecordingData] = useAtom(recordingDataAtom);
  const [activeTrackId, setActiveTrackId] = useAtom(activeTrackIdAtom);
  const [activeSetId, setActiveSetId] = useAtom(activeSetIdAtom);
  const [predefinedModules, setPredefinedModules] = useState([]);
  const [selectedChannel, setSelectedChannel] = useAtom(selectedChannelAtom);
  const [, flashChannel] = useFlashingChannels();
  const [, setFlashingConstructors] = useAtom(flashingConstructorsAtom);

  const sendToProjector = useIPCSend("dashboard-to-projector");
  const invokeIPC = useIPCInvoke();

  const {
    workspacePath,
    setWorkspacePath,
    isWorkspaceModalOpen,
    setIsWorkspaceModalOpen,
    workspaceModalMode,
    setWorkspaceModalMode,
    workspaceModalPath,
    setWorkspaceModalPath,
    isCreateTrackOpen,
    setIsCreateTrackOpen,
    isCreateSetOpen,
    setIsCreateSetOpen,
    isSelectTrackModalOpen,
    setIsSelectTrackModalOpen,
    isSelectSetModalOpen,
    setIsSelectSetModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isInputMappingsModalOpen,
    setIsInputMappingsModalOpen,
    isReleaseNotesOpen,
    setIsReleaseNotesOpen,
    isAddModuleModalOpen,
    setIsAddModuleModalOpen,
    isManageModulesModalOpen,
    setIsManageModulesModalOpen,
    isDebugOverlayOpen,
    setIsDebugOverlayOpen,
    selectedTrackForModuleMenu,
    setSelectedTrackForModuleMenu,
    openAddModuleModal,
    handleCreateNewModule,
    handleCreateModule,
    handleEditModule,
    handleCloseModuleEditor,
    isModuleEditorOpen,
    editingModuleName,
    editingTemplateType,
    isNewModuleDialogOpen,
    setIsNewModuleDialogOpen,
    confirmationModal,
    setConfirmationModal,
    openAlertModal,
    openConfirmationModal,
    debugLogs,
    setDebugLogs,
    isSequencerMuted,
    setIsSequencerMuted,
    isProjectorReady,
    setIsProjectorReady,
    perfStats,
    setPerfStats,
    editChannelModalState,
    setEditChannelModalState,
    handleEditChannel,
    handleDeleteChannel,
  } = useDashboardUiState({ selectedChannel, setUserData, activeSetId });

  const userDataRef = useLatestRef(userData);
  const recordingDataRef = useLatestRef(recordingData);

  const activeTrackIdRef = useRef(String(activeTrackId));
  const activeSetIdRef = useRef(activeSetId);
  const workspacePathRef = useRef(null);
  useEffect(() => {
    activeTrackIdRef.current = String(activeTrackId);
    activeSetIdRef.current = activeSetId;
    workspacePathRef.current = workspacePath;
  }, [activeTrackId, activeSetId, workspacePath]);

  // Recording state management
  const [recordingState, setRecordingState] = useAtom(recordingStateAtom);
  const recordingStateRef = useLatestRef(recordingState);
  const triggerMapsRef = useRef({ trackTriggersMap: {}, channelMappings: {} });

  const isInitialMount = useRef(true);
  const userDataLoadedSuccessfully = useRef(false);

  const [inputConfig, setInputConfig] = useState({
    type: "midi",
    deviceName: "IAC Driver Bus 1",
    trackSelectionChannel: 1,
    methodTriggerChannel: 2,
    velocitySensitive: false,
    port: 8000,
  });
  const [inputStatus, setInputStatus] = useState({
    status: "disconnected",
    message: "",
  });
  const [workspaceModuleFiles, setWorkspaceModuleFiles] = useState([]);
  const [workspaceModuleLoadFailures, setWorkspaceModuleLoadFailures] = useState([]);
  const [workspaceModuleSkipped, setWorkspaceModuleSkipped] = useState([]);
  const didMigrateWorkspaceModuleTypesRef = useRef(false);
  const loadModulesRunIdRef = useRef(0);
  const sequencerMutedRef = useLatestRef(isSequencerMuted);
  const { aspectRatio, setAspectRatio, bgColor, setBgColor, settings, availableMidiDevices } =
    useDashboardProjectorSettings({
      userData,
      setUserData,
      invokeIPC,
      sendToProjector,
    });

  useInputEvents({
    userData,
    activeSetId,
    userDataRef,
    activeTrackIdRef,
    activeSetIdRef,
    recordingStateRef,
    triggerMapsRef,
    setActiveTrackId,
    setRecordingData,
    setRecordingState,
    flashChannel,
    setFlashingConstructors,
    setInputStatus,
    setDebugLogs,
    sendToProjector,
    isDebugOverlayOpen,
    setIsProjectorReady,
  });

  useDashboardInputConfiguration({ userData, setUserData, invokeIPC, inputConfig });

  useDashboardPersistence({
    isInitialMountRef: isInitialMount,
    userDataLoadedSuccessfullyRef: userDataLoadedSuccessfully,
    userData,
    recordingData,
    activeTrackId,
    activeSetId,
    userDataRef,
    recordingDataRef,
    activeTrackIdRef,
    activeSetIdRef,
    workspacePathRef,
    sequencerMutedRef,
    sendToProjector,
    isSequencerMuted,
  });

  useModuleIntrospection({
    activeSetId,
    setUserData,
    setPredefinedModules,
    setWorkspaceModuleLoadFailures,
  });
  useProjectorPerfStats(setPerfStats);

  useWorkspaceModules({
    workspacePath,
    isWorkspaceModalOpen,
    sendToProjector,
    userData,
    setUserData,
    predefinedModules,
    workspaceModuleFiles,
    setPredefinedModules,
    setWorkspaceModuleFiles,
    setWorkspaceModuleLoadFailures,
    setWorkspaceModuleSkipped,
    setIsProjectorReady,
    didMigrateWorkspaceModuleTypesRef,
    loadModulesRunIdRef,
  });

  useWorkspaceModuleIntrospectionDrain({
    workspacePath,
    isProjectorReady,
    workspaceModuleLoadFailures,
    workspaceModuleFiles,
    sendToProjector,
  });

  useDashboardBootstrap({
    isInitialMountRef: isInitialMount,
    userDataLoadedSuccessfullyRef: userDataLoadedSuccessfully,
    workspacePathRef,
    // FIXME avoid props drilling! - type override temporary
    setUserData: setUserData as any,
    setRecordingData,
    setActiveTrackId,
    setActiveSetId,
    // FIXME avoid props drilling! - type override temporary
    setInputConfig: setInputConfig as any,
    setIsSequencerMuted,
    setWorkspacePath,
    setWorkspaceModalMode,
    setWorkspaceModalPath,
    setIsWorkspaceModalOpen,
  });

  const handleSelectWorkspace = useCallback(async () => {
    await invokeIPC("workspace:select");
  }, [invokeIPC]);

  const firstVisibleTrack = useMemo(() => {
    if (!activeTrackId) return null;
    const tracks = getActiveSetTracks(userData, activeSetId);
    const track = tracks.find((t) => t.id === activeTrackId);
    if (!track) return null;
    const trackIndex = tracks.findIndex((t) => t.id === activeTrackId);
    return { track, trackIndex };
  }, [activeTrackId, userData, activeSetId]);

  const {
    footerPlaybackState,
    isSequencerPlaying,
    sequencerCurrentStep,
    handleSequencerToggle,
    handleFooterPlayPause,
    handleFooterStop,
    sequencerEngineRef,
    sequencerRunIdRef,
    setIsSequencerPlaying,
    setSequencerCurrentStep,
  } = useDashboardPlayback({
    userData,
    userDataRef,
    activeTrackId,
    activeSetId,
    activeSetIdRef,
    firstVisibleTrack,
    recordingData,
    recordingDataRef,
    // FIXME avoid props drilling! - type override temporary
    setRecordingData: setRecordingData as any,
    sendToProjector,
    flashChannel,
    setFlashingConstructors,
    isSequencerMuted,
    setIsProjectorReady,
    isInitialMountRef: isInitialMount,
  });

  const updateConfig = useDashboardUpdateConfig({
    // FIXME avoid props drilling! - type override temporary
    setUserData: setUserData as any,
    userDataConfig: userData.config,
    isSequencerPlaying,
    sequencerEngineRef,
    sequencerRunIdRef,
    setIsSequencerPlaying,
    setSequencerCurrentStep,
  });

  return (
    <div className="relative bg-[#101010] font-mono h-screen flex flex-col">
      <DashboardHeader
        onSets={() => setIsSelectSetModalOpen(true)}
        onTracks={() => setIsSelectTrackModalOpen(true)}
        onModules={() => setIsManageModulesModalOpen(true)}
        onSettings={() => setIsSettingsModalOpen(true)}
        onDebugOverlay={() => setIsDebugOverlayOpen(true)}
        onReleases={() => setIsReleaseNotesOpen(true)}
      />

      <div className="flex-1 overflow-y-auto pt-12 pb-32">
        <div className="bg-[#101010] p-6 font-mono">
          <DashboardBody
            userData={userData}
            activeSetId={activeSetId}
            activeTrackId={activeTrackId}
            predefinedModules={predefinedModules}
            openAddModuleModal={openAddModuleModal}
            openConfirmationModal={openConfirmationModal}
            setActiveTrackId={setActiveTrackId}
            inputConfig={inputConfig}
            config={userData.config}
            isSequencerPlaying={isSequencerPlaying}
            sequencerCurrentStep={sequencerCurrentStep}
            handleSequencerToggle={handleSequencerToggle}
            workspacePath={workspacePath}
            workspaceModuleFiles={workspaceModuleFiles}
            workspaceModuleLoadFailures={workspaceModuleLoadFailures}
          />
        </div>
      </div>

      <DashboardFooter
        track={firstVisibleTrack?.track || null}
        isPlaying={
          userData.config.sequencerMode
            ? isSequencerPlaying
            : firstVisibleTrack
              ? footerPlaybackState[firstVisibleTrack.track.id] || false
              : false
        }
        onPlayPause={handleFooterPlayPause}
        onStop={handleFooterStop}
        inputStatus={inputStatus}
        inputConfig={inputConfig}
        config={userData.config}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        isMuted={isSequencerMuted}
        onMuteChange={setIsSequencerMuted}
        isProjectorReady={isProjectorReady}
      />

      <DashboardModalLayer
        isCreateTrackOpen={isCreateTrackOpen}
        setIsCreateTrackOpen={setIsCreateTrackOpen}
        isCreateSetOpen={isCreateSetOpen}
        setIsCreateSetOpen={setIsCreateSetOpen}
        isSelectTrackModalOpen={isSelectTrackModalOpen}
        setIsSelectTrackModalOpen={setIsSelectTrackModalOpen}
        isSelectSetModalOpen={isSelectSetModalOpen}
        setIsSelectSetModalOpen={setIsSelectSetModalOpen}
        isSettingsModalOpen={isSettingsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        isInputMappingsModalOpen={isInputMappingsModalOpen}
        setIsInputMappingsModalOpen={setIsInputMappingsModalOpen}
        isReleaseNotesOpen={isReleaseNotesOpen}
        setIsReleaseNotesOpen={setIsReleaseNotesOpen}
        isAddModuleModalOpen={isAddModuleModalOpen}
        setIsAddModuleModalOpen={setIsAddModuleModalOpen}
        isManageModulesModalOpen={isManageModulesModalOpen}
        setIsManageModulesModalOpen={setIsManageModulesModalOpen}
        isDebugOverlayOpen={isDebugOverlayOpen}
        setIsDebugOverlayOpen={setIsDebugOverlayOpen}
        // FIXME avoid props drilling! - type override temporary
        userData={userData as any}
        setUserData={setUserData}
        recordingData={recordingData}
        setRecordingData={setRecordingData}
        activeTrackId={activeTrackId}
        setActiveTrackId={setActiveTrackId}
        activeSetId={activeSetId}
        setActiveSetId={setActiveSetId}
        inputConfig={inputConfig}
        // FIXME avoid props drilling! - type override temporary
        setInputConfig={setInputConfig as (config: Record<string, unknown>) => void}
        availableMidiDevices={availableMidiDevices}
        settings={settings}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        bgColor={bgColor}
        setBgColor={setBgColor}
        updateConfig={updateConfig}
        workspacePath={workspacePath}
        onSelectWorkspace={handleSelectWorkspace}
        predefinedModules={predefinedModules}
        selectedTrackForModuleMenu={selectedTrackForModuleMenu}
        setSelectedTrackForModuleMenu={setSelectedTrackForModuleMenu}
        onCreateNewModule={handleCreateNewModule}
        onEditModule={handleEditModule}
        isModuleEditorOpen={isModuleEditorOpen}
        onCloseModuleEditor={handleCloseModuleEditor}
        editingModuleName={editingModuleName}
        editingTemplateType={editingTemplateType}
        isNewModuleDialogOpen={isNewModuleDialogOpen}
        onCloseNewModuleDialog={() => setIsNewModuleDialogOpen(false)}
        onCreateModule={handleCreateModule}
        debugLogs={debugLogs}
        perfStats={perfStats}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        onEditChannel={handleEditChannel}
        onDeleteChannel={handleDeleteChannel}
        workspaceModuleFiles={workspaceModuleFiles}
        workspaceModuleLoadFailures={workspaceModuleLoadFailures}
        workspaceModuleSkipped={workspaceModuleSkipped}
        editChannelModalState={editChannelModalState}
        setEditChannelModalState={setEditChannelModalState}
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        openAlertModal={openAlertModal}
        openConfirmationModal={openConfirmationModal}
      />

      <WorkspaceGateModal
        isOpen={isWorkspaceModalOpen}
        mode={workspaceModalMode}
        workspacePath={workspacePath}
        workspaceModalPath={workspaceModalPath}
        onSelectWorkspace={handleSelectWorkspace}
      />
    </div>
  );
};

export default Dashboard;

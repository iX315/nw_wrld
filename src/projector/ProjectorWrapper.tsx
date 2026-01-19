import { useEffect, useRef } from "react";
import Projector from "./Projector";

export const ProjectorWrapper = () => {
  const projectorRef = useRef(null!)

  useEffect(() => {
    if (projectorRef.current && document.querySelector(".projector")) {
      Projector.init();
    }
  })

  return (
    <div className='projector' ref={projectorRef}>
      <div className="drag-region"/>
      <div className="modules" />
    </div>
  )
}
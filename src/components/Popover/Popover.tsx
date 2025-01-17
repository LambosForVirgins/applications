import "@oddbird/popover-polyfill";
import "@oddbird/css-anchor-positioning/fn";
import styles from "./Popover.module.css";
import { NavLink } from "react-router";
import React, { useRef } from "react";
import { useDevToggles } from "@/state/application/useDevToggles";

interface PopoverProps extends Common.ComponentProps {
  id: string;
  onDisconnect?: () => void;
}

export const Popover = ({ testID, ...props }: PopoverProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { isEnabled } = useDevToggles();

  const dismissPopover: React.MouseEventHandler<HTMLElement> = () => {
    if (!dialogRef.current) return;
    dialogRef.current.hidePopover();
  };

  return (
    <dialog
      data-testid={testID}
      ref={dialogRef}
      role="menu"
      popover="manual"
      id={props.id}
      className={styles.frame}
      onClick={dismissPopover}
      onMouseLeave={dismissPopover}
    >
      <ul data-testid={`${testID}.options`} className={styles.list}>
        <NavLink to="/account">
          <li>
            <span>Account</span>
            <span className={styles.badge}>1</span>
          </li>
        </NavLink>
        <NavLink to="/giveaways">
          <li>Giveaways</li>
        </NavLink>
        {isEnabled("merchandise") && (
          <NavLink to="/store">
            <li>Merchandise</li>
          </NavLink>
        )}
        <NavLink to="/subscription">
          <li>Subscription</li>
        </NavLink>
        {isEnabled("events") && (
          <NavLink to="/events">
            <li>Events</li>
          </NavLink>
        )}
        <li className={styles.caution} onClick={props.onDisconnect}>
          Logout
        </li>
      </ul>
    </dialog>
  );
};

import * as React from "react";
import { Modal } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import { useSpring, animated } from "react-spring/web.cjs";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: "2px solid #000",
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3)
    }
  })
);

interface FadeProps {
  children?: React.ReactElement;
  in: boolean;
  onEnter?: () => {};
  onExited?: () => {};
}

const Fade = React.forwardRef<HTMLDivElement, FadeProps>(function Fade(
  props,
  ref
) {
  const { in: open, children, onEnter, onExited, ...other } = props;
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: open ? 1 : 0 },
    onStart: () => {
      if (open && onEnter) {
        onEnter();
      }
    },
    onRest: () => {
      if (!open && onExited) {
        onExited();
      }
    }
  });

  return (
    <animated.div ref={ref} style={style} {...other}>
      {children}
    </animated.div>
  );
});

export const ModalPopup = (p: {
  modalState: ModalState;
  closeModal(): void;
}) => {
  const classes = useStyles();
  const onModalAction = (action: any) => {
    p.closeModal();
    action();
  };

  const Button = (p: { button: ModalButton | null; autoFocus: boolean }) => {
    if (p.button == null || p.button.text == "") {
      return null;
    } else {
      return (
        <button
          className="button__box--left"
          autoFocus={p.autoFocus}
          onClick={() => onModalAction(p.button?.action)}
        >
          {p.button.text}
        </button>
      );
    }
  };

  return (
    <Modal
      aria-labelledby="spring-modal-title"
      aria-describedby="spring-modal-description"
      className={classes.modal}
      open={p.modalState.active}
      onClose={() => null}
      onEscapeKeyDown={() => onModalAction(p.modalState.leftButton?.action)}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500
      }}
    >
      <Fade in={p.modalState.active}>
        <div className={classes.paper}>
          <h2>{p.modalState.title}</h2>
          <p>{p.modalState.message}</p>
          <div className="button__row">
            <Button button={p.modalState.leftButton} autoFocus={true}></Button>
            <Button
              button={p.modalState.rightButton}
              autoFocus={false}
            ></Button>
          </div>
        </div>
      </Fade>
    </Modal>
  );
};

export type ModalState = {
  active: boolean;
  title: string;
  message: string;
  leftButton: ModalButton | null;
  rightButton: ModalButton | null;
};

export type ModalButton = {
  text: string;
  action(): void;
};

export default ModalPopup;

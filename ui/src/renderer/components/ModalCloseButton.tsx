import PrettyIcons from "js-pretty-icons";

interface ModalCloseButtonProps {
  onClick: () => void;
}

export function ModalCloseButton({ onClick }: ModalCloseButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className="modal-close"
      onClick={onClick}
      aria-label="Close modal"
    >
      <PrettyIcons icon="close" width={24} height={24} color="#d95067" />
    </button>
  );
}

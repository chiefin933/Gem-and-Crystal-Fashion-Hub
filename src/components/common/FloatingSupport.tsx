import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { WhatsAppButton } from "./WhatsAppButton";
import { openGemAssistant } from "../../utils/support";

export function FloatingSupport() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const visibleModal = Array.from(
        document.querySelectorAll<HTMLElement>('[aria-modal="true"]'),
      ).some((modal) => modal.getClientRects().length > 0);
      setModalOpen(visibleModal);
    };
    const observer = new MutationObserver(updateVisibility);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-modal", "class", "hidden"],
    });
    const frame = window.requestAnimationFrame(updateVisibility);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="floating-support"
      aria-label="Customer support"
      aria-hidden={modalOpen}
      style={{ visibility: modalOpen ? "hidden" : "visible" }}
    >
      <WhatsAppButton />
      <button
        className="floating-support-ai"
        onClick={openGemAssistant}
        aria-label="Open Gem AI assistant"
        title="Gem AI assistant"
      >
        <Bot size={20} />
      </button>
    </div>
  );
}

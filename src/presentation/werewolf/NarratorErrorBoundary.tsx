import { Component, type ErrorInfo, type ReactNode } from "react";
import { withTranslation, type WithTranslation } from "react-i18next";

interface Props extends WithTranslation {
  readonly children: ReactNode;
}

interface State {
  readonly error: Error | null;
}

/**
 * Catches an error while the narrator view is drawn: instead of an empty (black) screen the narrator sees what went wrong
 * and can try again; the saved game stays untouched.
 */
class Boundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Narrator view failed", error, info.componentStack);
  }

  override render() {
    const { error } = this.state;
    const { t } = this.props;
    if (!error) return this.props.children;
    return (
      <section className="ww-crash" role="alert">
        <strong>{t("werewolfNarrator.crash.title")}</strong>
        <p>{t("werewolfNarrator.crash.text")}</p>
        <pre>{error.message}</pre>
        <button onClick={() => this.setState({ error: null })} type="button">
          {t("werewolfNarrator.crash.retry")}
        </button>
      </section>
    );
  }
}

export const NarratorErrorBoundary = withTranslation()(Boundary);

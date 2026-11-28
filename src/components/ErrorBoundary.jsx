import { Component } from 'react';

// Catches crashes in any component so the user sees a message, not a blank page.
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="mx-auto min-h-[70vh] w-[calc(100%-2rem)] max-w-[1100px] py-8 pb-16">
        <div className="mb-4 rounded-lg bg-[#fbe4de] px-4 py-3 text-[#7e2412]">
          <h2>Something went wrong</h2>
          <p>The page crashed. Reload to try again.</p>
          <button
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => window.location.assign('/')}
          >
            Reload SkillSwap
          </button>
        </div>
      </div>
    );
  }
}

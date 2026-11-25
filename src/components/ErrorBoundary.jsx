import { Component } from 'react';

// Catches crashes in any component so the user sees a message, not a blank page.
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="container page">
        <div className="alert error">
          <h2>Something went wrong</h2>
          <p>The page crashed. Reload to try again.</p>
          <button className="btn btn-primary" onClick={() => window.location.assign('/')}>Reload SkillSwap</button>
        </div>
      </div>
    );
  }
}

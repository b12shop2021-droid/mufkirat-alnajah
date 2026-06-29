/* ===================================================================
   ErrorBoundary.tsx — يلتقط انهيار أي صفحة فيعرض رسالة ودّية + زر
   رجوع للرئيسية بدل الشاشة البيضاء. (لا يلتقط أخطاء async/الأحداث).
   =================================================================== */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // تسجيل بسيط — مفيد للتشخيص بدون كسر التطبيق
    console.error('ErrorBoundary التقط خطأ:', error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    // ارجع للرئيسية (wouter يعتمد على المسار)
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
          <div className="card" style={{ maxWidth: 380, margin: '0 auto' }}>
            <div style={{ fontSize: 46, marginBottom: 12 }}>😅</div>
            <h2 style={{ margin: '0 0 8px' }}>صار خطأ بسيط</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              ما عليه — بياناتك بخير. ارجع للرئيسية وكمّل.
            </p>
            <button className="btn-primary" onClick={this.handleReset}>
              ارجع للرئيسية ←
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

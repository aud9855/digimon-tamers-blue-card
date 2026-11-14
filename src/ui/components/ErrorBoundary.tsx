// 화면을 그리다 오류가 나면 빈 화면 대신 오류 내용과 되살리기 버튼을 보여 줌.
// React는 그리기 오류가 나면 화면 전체를 지우므로, 이것이 없으면 사용자는 빈 화면만 봅니다.
import { Component, type ReactNode } from 'react';
import { clearSavedGame } from '../save';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return <ErrorScreen message={`${error.name}: ${error.message}`} />;
  }
}

/** 오류 화면 (index.html의 부팅 실패 안내와 같은 일을 React 안에서) */
export function ErrorScreen({ message }: { message: string }) {
  const resetRun = async () => {
    // 진행 중인 판만 지움. 도감·해금(프로필)과 설정은 남김
    await clearSavedGame().catch(() => undefined);
    location.replace(location.pathname + '?r=' + Date.now());
  };
  return (
    <div
      data-testid="error-screen"
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-950 px-6 text-center text-slate-200"
    >
      <p className="text-lg font-bold">화면을 그리다 문제가 생겼습니다</p>
      <p className="text-sm text-slate-400">
        진행 중이던 판을 지우고 처음으로 돌아가면 대부분 해결됩니다. 도감과 해금 기록은 남습니다.
      </p>
      <button
        type="button"
        onClick={() => void resetRun()}
        className="min-h-11 rounded-lg bg-sky-600 px-5 font-bold text-white"
      >
        저장 지우고 처음으로
      </button>
      <button
        type="button"
        onClick={() => location.reload()}
        className="min-h-11 rounded-lg bg-slate-800 px-5 text-sm"
      >
        그냥 다시 불러오기
      </button>
      <p className="mt-4 text-xs text-slate-500">오류 내용 (알려 주시면 고치는 데 도움이 됩니다)</p>
      <pre className="max-w-full overflow-x-auto rounded bg-slate-900 p-2 text-left text-xs whitespace-pre-wrap text-rose-300 select-all">
        {message}
      </pre>
    </div>
  );
}

import { SimpleLayout } from './SimpleLayout'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <SimpleLayout title="Recall Notes" subtitle="エラーが発生しました">
      <div className="error-message">
        <p>{message}</p>
        <button onClick={onRetry || (() => window.location.reload())}>
          再読み込み
        </button>
      </div>
    </SimpleLayout>
  )
}
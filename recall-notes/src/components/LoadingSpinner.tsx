import { SimpleLayout } from './SimpleLayout'

interface LoadingSpinnerProps {
  message?: string
}

export const LoadingSpinner = ({ message = "読み込み中..." }: LoadingSpinnerProps) => {
  return (
    <SimpleLayout title="Recall Notes" subtitle="初期化中...">
      <div className="loading">{message}</div>
    </SimpleLayout>
  )
}
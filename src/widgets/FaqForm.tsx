import { useEffect, useState } from 'react'

interface FaqFormProps {
  mode: 'create' | 'edit'
  initialQuestion?: string
  initialAnswer?: string
  disabled?: boolean
  onSubmit: (data: { question: string; answer: string }) => Promise<void> | void
  onCancel?: () => void
}

export function FaqForm({ mode, initialQuestion = '', initialAnswer = '', disabled = false, onSubmit, onCancel }: FaqFormProps) {
  const [question, setQuestion] = useState(initialQuestion)
  const [answer, setAnswer] = useState(initialAnswer)

  useEffect(() => {
    setQuestion(initialQuestion)
    setAnswer(initialAnswer)
  }, [initialQuestion, initialAnswer])

  const isEdit = mode === 'edit'

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await onSubmit({ question: question.trim(), answer: answer.trim() })
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 600 }}
    >
      <label>
        <div>Question</div>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="質問"
          disabled={disabled || isEdit}
          required
          style={{ width: '100%', padding: 8 }}
        />
      </label>
      <label>
        <div>Answer</div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="回答"
          disabled={disabled}
          required
          rows={4}
          style={{ width: '100%', padding: 8 }}
        />
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={disabled}>
          {isEdit ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={disabled}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}



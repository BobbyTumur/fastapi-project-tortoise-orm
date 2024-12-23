import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/services/[service_id]/log')({
  component: () => <div>Hello /_layout/services/[service_id]/log!</div>,
})

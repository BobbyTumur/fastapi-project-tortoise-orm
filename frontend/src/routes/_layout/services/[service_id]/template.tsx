import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/services/[service_id]/template')(
  {
    component: () => <div>Hello /_layout/services/[service_id]/template!</div>,
  },
)

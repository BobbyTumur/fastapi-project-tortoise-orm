import { createFileRoute, useParams } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/services/$service_id/log')({
  component: Log,
})


function Log() {
  // Use `useParams` with an options object
  const { service_id } = useParams({ from: '/_layout/services/$service_id/log' });

  return (
    <div>
      <h1>Log for Service ID: {service_id}</h1>
      {/* Add your Log content or further logic here */}
    </div>
  );
}

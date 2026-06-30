import { PageLayout } from "@/components/layout/PageLayout"

export default function ContactPage() {
  return (
    <PageLayout title="Contact">
      <p>
        Have feedback, suggestions, or found a bug? We would love to hear from you.
      </p>
      <p>
        Reach out at{" "}
        <a href="mailto:contact@blitzzone.app" className="text-blue-400 hover:text-blue-300">
          contact@blitzzone.app
        </a>
      </p>
    </PageLayout>
  )
}

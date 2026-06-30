import { PageLayout } from "@/components/layout/PageLayout"

export default function PrivacyPage() {
  return (
    <PageLayout title="Privacy Policy">
      <p>
        BlitzZone does not collect personal data. Game scores and progress are stored locally in
        your browser and are not transmitted to any server.
      </p>
      <p>
        If this changes in the future, this policy will be updated accordingly.
      </p>
    </PageLayout>
  )
}

import { OrganizationProfile } from "@/modules/organizations/components/organization-profile";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  return <OrganizationProfile organizationId={organizationId} />;
}

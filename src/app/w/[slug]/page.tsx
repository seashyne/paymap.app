import { redirect } from "next/navigation"

export default function WorkspaceSlugIndex({ params }: { params: { slug: string } }) {
  redirect(`/w/${params.slug}/dashboard`)
}

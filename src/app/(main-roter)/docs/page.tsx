import { redirect } from "next/navigation";

/** Legacy /docs route — redirects to /repos */
export default function DocsPage() {
    redirect("/repos");
}

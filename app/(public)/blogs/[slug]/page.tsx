import { redirect } from "next/navigation";

type BlogsArticlePageProps = {
  params: {
    slug: string;
  };
};

export default function BlogsArticlePage({ params }: BlogsArticlePageProps) {
  redirect(`/blog/${params.slug}`);
}

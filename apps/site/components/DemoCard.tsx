import Link from "next/link";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sixtyfour-demos/ui";
import { CategoryPreview } from "./CategoryPreview";
import type { Demo } from "../lib/demos";

interface DemoCardProps {
  demo: Demo;
}

export function DemoCard({ demo }: DemoCardProps) {
  const isLive = demo.status === "live";
  const href = isLive ? `/demos/${demo.slug}` : `/coming-soon?demo=${demo.slug}`;

  return (
    <Link
      href={href}
      className="group focus-visible:outline-none"
      aria-label={`${demo.title} — ${isLive ? "View demo" : "Coming soon"}`}
    >
      <Card className="h-full hover:border-blue-400/30 group-focus-visible:ring-2 group-focus-visible:ring-blue-400">
        <CardHeader>
          <CategoryPreview category={demo.category} />
          <div className="mt-3 flex items-center justify-between gap-2">
            <CardTitle>{demo.title}</CardTitle>
            {!isLive && (
              <Badge variant="muted" className="shrink-0">
                Coming soon
              </Badge>
            )}
          </div>
          <CardDescription className="line-clamp-3">{demo.oneLiner}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {demo.tags.map((tag) => (
              <Badge key={tag} variant="default" className="font-mono text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

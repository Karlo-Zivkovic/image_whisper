import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getClientQueries } from "@/lib/server/getClientQueries";

export default async function ClientQueryList() {
  const items = await getClientQueries();
  return (
    <div className="grid gap-6">
      {items?.map((item) => (
        <Card key={item.id} className="flex items-center gap-4 p-4">
          <Avatar>
            <AvatarImage src={item.image_url} alt="Uploaded" />
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold mb-1">Query:</div>
            <div className="mb-2 text-sm bg-muted p-2 rounded whitespace-pre-wrap">
              {item.query_text}
            </div>
            <div className="text-xs text-muted-foreground">
              Uploaded: {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
          <Button
            onClick={() => {
              if (item.query_text) {
                navigator.clipboard.writeText(item.query_text);
              }
            }}
            variant="outline"
          >
            Copy Query
          </Button>
        </Card>
      ))}
    </div>
  );
}

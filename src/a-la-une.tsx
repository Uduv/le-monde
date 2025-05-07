import { List, ActionPanel, Action, Detail, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import Parser from "rss-parser";

type NewsItem = {
  title: string;
  link: string;
  pubDate?: string;
  content?: string;
};

export default function Command() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { push } = useNavigation();

  useEffect(() => {
    async function fetchNews() {
      try {
        const parser = new Parser();
        const feed = await parser.parseURL("https://www.lemonde.fr/rss/une.xml");
        const parsedItems = feed.items.map((item) => ({
          title: item.title ?? "Sans titre",
          link: item.link ?? "",
          pubDate: item.pubDate,
          content: item.contentSnippet ?? "",
        }));
        setItems(parsedItems);
      } catch (error) {
        console.error("Erreur lors du chargement du flux RSS:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, []);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Rechercher dans les titres...">
      {items.map((item, index) => (
        <List.Item
          key={index}
          title={item.title}
          subtitle={item.pubDate}
          actions={
            <ActionPanel>
              <Action
                title="Lire L'article"
                onAction={() => push(<ArticleDetail item={item} />)} // ✅ Opens in full page
              />
              <Action.OpenInBrowser
                title="Ouvrir Dans Le Navigateur"
                url={item.link}
                shortcut={{ modifiers: ["cmd"], key: "enter" }} // ✅ Cmd+Enter opens browser
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

function ArticleDetail({ item }: { item: NewsItem }) {
  return (
    <Detail
      markdown={`# ${item.title}\n\n${item.content}\n\n[Lire sur lemonde.fr](${item.link})`}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title="Ouvrir L'article Dans Le Navigateur" url={item.link} />
        </ActionPanel>
      }
    />
  );
}

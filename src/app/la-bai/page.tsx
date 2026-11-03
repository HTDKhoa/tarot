import { PageShell } from "@/components/ui/PageShell";
import { DeckIndex } from "@/components/ui/DeckIndex";
import { allCards, toPublic } from "@/lib/tarot/cards";

export const metadata = {
  title: "Bộ bài · Ngôi Nhà Trong Rừng",
  description: "Cả bộ 78 lá tarot: tranh vẽ tay và ý nghĩa từng lá, xuôi và ngược, theo tình cảm, công việc, tài chính và bản thân.",
};

export default function DeckPage() {
  const cards = allCards().map((c) => toPublic(c));
  return (
    <PageShell title="Bộ bài" lead="Cả bộ 78 lá trên bàn của Nguyệt. Chạm vào một lá để xem tranh và ý nghĩa của nó, xuôi lẫn ngược.">
      <DeckIndex cards={cards} />
    </PageShell>
  );
}

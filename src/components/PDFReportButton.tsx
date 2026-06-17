import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { gerarRelatorioIndividual } from "@/lib/pdf";

interface Props {
  cnpj: string;
  dbData: Record<string, any>;
  companyId?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  label?: string;
}

export function PDFReportButton({ cnpj, dbData, companyId, variant = "outline", size = "sm", label = "PDF" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      toast.info("Gerando relatório PDF… buscando dados completos.");
      await gerarRelatorioIndividual(cnpj, dbData, companyId);
      toast.success("Relatório PDF gerado com sucesso.");
    } catch (e: any) {
      toast.error(`Erro ao gerar PDF: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={variant}
      size={size}
      className="font-mono text-[11px] uppercase"
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
        : <FileText className="h-3.5 w-3.5 mr-1.5" />}
      {loading ? "Gerando…" : label}
    </Button>
  );
}

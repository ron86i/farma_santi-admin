import { Link } from "react-router";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { MouseEventHandler } from "react";
import { Button } from "@/components/ui/button";

interface ButtonLinkProps {
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  to: string;
  title: string;
  nameIcon: IconName;
}

export function ButtonLink({ onClick, to, nameIcon, title }: ButtonLinkProps) {
  return (
    <Button
      variant="ghost"
      asChild
      className="w-full justify-start text-left hover:bg-primary/20 transition-colors duration-300 ease-in-out"
    >
      <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2 rounded-lg"
      >
        <DynamicIcon name={nameIcon} size={20} />
        <span className="transition-transform group-hover:translate-x-1 font-medium">
          {title}
        </span>
      </Link>
    </Button>
  );
}

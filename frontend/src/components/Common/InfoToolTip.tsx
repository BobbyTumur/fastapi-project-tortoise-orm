import { Tooltip } from "@chakra-ui/react";
import { LuInfo } from "react-icons/lu";

interface InfoTooltipProps {
  label: string;
}
const InfoTooltip = ({ label }: InfoTooltipProps) => {
  return (
    <Tooltip label={label} fontSize="xs">
      <span>
        <LuInfo size="12px" />
      </span>
    </Tooltip>
  );
};

export default InfoTooltip;

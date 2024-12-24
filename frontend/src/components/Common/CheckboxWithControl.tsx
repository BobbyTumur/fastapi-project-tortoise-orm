import React from "react";
import { Checkbox } from "@chakra-ui/react";
import { useController, Control, UseFormSetValue } from "react-hook-form";

interface CheckboxWithControlProps {
  service: {
    id: string;
    name: string;
  };
  control: Control<{ added_services: string[] }>;
  setValue: UseFormSetValue<{ added_services: string[] }>;
}

const CheckboxWithControl: React.FC<CheckboxWithControlProps> = React.memo(
  ({ service, control, setValue }) => {
    const { field } = useController({
      control,
      name: "added_services",
      defaultValue: [],
    });

    const isChecked = (field.value as string[]).includes(service.id);

    const handleChange = () => {
      const currentIds = field.value as string[];
      const updatedIds = isChecked
        ? currentIds.filter((id) => id !== service.id)
        : [...currentIds, service.id];

      setValue("added_services", updatedIds); // Correct usage of setValue
    };

    return (
      <Checkbox
        id={`service-${service.id}`}
        isChecked={isChecked}
        onChange={handleChange}
      >
        {service.name}
      </Checkbox>
    );
  }
);

export default CheckboxWithControl;

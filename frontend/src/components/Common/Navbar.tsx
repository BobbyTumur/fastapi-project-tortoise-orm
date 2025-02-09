import type { ComponentType, ElementType } from "react";

import { Button, Flex, Icon, useDisclosure } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

interface NavbarProps {
  text: string;
  addModalAs: ComponentType | ElementType;
  addModalProps?: Record<string, any>;
}

const Navbar = ({ text, addModalAs, addModalProps = {} }: NavbarProps) => {
  const addModal = useDisclosure();

  const AddModal = addModalAs;
  return (
    <>
      <Flex py={8} gap={4}>
        {/* TODO: Complete search functionality */}
        {/* <InputGroup w={{ base: '100%', md: 'auto' }}>
                    <InputLeftElement pointerEvents='none'>
                        <Icon as={FaSearch} color='ui.dim' />
                    </InputLeftElement>
                    <Input type='text' placeholder='Search' fontSize={{ base: 'sm', md: 'inherit' }} borderRadius='8px' />
                </InputGroup> */}
        <Button
          variant="primary"
          gap={1}
          fontSize={{ base: "sm", md: "inherit" }}
          onClick={addModal.onOpen}
        >
          <Icon as={FaPlus} /> {text}
        </Button>
        <AddModal
          isOpen={addModal.isOpen}
          onClose={addModal.onClose}
          {...addModalProps}
        />
      </Flex>
    </>
  );
};

export default Navbar;

import { useState, useMemo } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import { Heading } from "@chakra-ui/react";
import {
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Select,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  ApiRecord,
  getModuleRecords,
  modules,
  Module,
} from "../libs/get-module-records";

type Props = {
  records: ApiRecord[];
};

const IndexPage = ({ records }: Props) => {
  const [moduleFilter, setModuleFilter] = useState<Module | null>(null);
  const filteredRecords = useMemo(
    () =>
      moduleFilter
        ? records.filter((record) => record.module === moduleFilter)
        : records,
    [records, moduleFilter]
  );
  console.log({ moduleFilter });
  return (
    <div>
      <Head>
        <title>Node.js API Table</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Box bg="Green" w="100%" p={4} color="white">
        <Heading as="h1" size="2xl">
          Node.js API Table
        </Heading>
      </Box>
      <Flex w="100%" p={4} borderWidth="1px">
        <FormControl mw={3}>
          <FormLabel>Module</FormLabel>
          <Select
            placeholder="all"
            onChange={(e) => {
              setModuleFilter(e.target.value as Module);
            }}
          >
            {modules.map((module) => (
              <option value={module} key={module}>
                {module}
              </option>
            ))}
          </Select>
        </FormControl>
      </Flex>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Module</Th>
            <Th>API</Th>
            <Th>Supported</Th>
            <Th>Backported</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredRecords.map(({ module, api, supported, backported }) => (
            <Tr key={`${module}${api}`}>
              <Td>{module}</Td>
              <Td>
                <Code>{api}</Code>
              </Td>
              <Td>{supported}</Td>
              <Td>
                {backported.length === 0
                  ? ""
                  : backported.reduce(
                      (prev, current) => prev + current + ",",
                      ""
                    )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const moduleRecords = await getModuleRecords();
  return { props: { records: moduleRecords } };
};

export default IndexPage;

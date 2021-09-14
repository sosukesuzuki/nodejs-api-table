import { useState, useMemo } from "react";
import { GetStaticProps } from "next";
import Head from "next/head";
import {
  Box,
  Flex,
  Heading,
  Input,
  SimpleGrid,
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
  Link,
} from "@chakra-ui/react";
import semverCompare from "semver-compare";

import {
  ApiRecord,
  getModuleRecords,
  modules,
  Module,
} from "../libs/get-module-records";
import { getFormattedDate } from "../libs/get-formatted-date";

type Props = {
  records: ApiRecord[];
  lastFetched: string;
};

type RecordFilter = (record: ApiRecord) => boolean;

const IndexPage = ({ records, lastFetched }: Props) => {
  const [moduleFilter, setModuleFilter] = useState<Module | null>(null);
  const [minVerFilter, setMinVerFilter] = useState<string | null>(null);
  const filteredRecords = useMemo(() => {
    if (!moduleFilter && !minVerFilter) {
      return records;
    }
    const minVer = minVerFilter?.startsWith("v")
      ? minVerFilter?.slice(1)
      : minVerFilter;
    const f: RecordFilter = moduleFilter
      ? (record) => record.module === moduleFilter
      : (_) => true;
    const g: RecordFilter = minVer
      ? (record) => {
          return semverCompare(record.supported.slice(1), minVer) >= 0;
        }
      : (_) => true;
    return records.filter((record) => f(record) && g(record));
  }, [records, moduleFilter, minVerFilter]);
  return (
    <div>
      <Head>
        <title>Node.js API Table</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Box bg="Green" w="100%" p={4} color="white">
        <Heading as="h1" size="2xl">
          Node.js API Table (last fetched: {lastFetched})
        </Heading>
      </Box>
      <Flex w="100%" p={4} borderWidth="1px">
        <FormControl mw={2}>
          <SimpleGrid columns={2} spacing={4}>
            <Box>
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
            </Box>
            <Box>
              <FormLabel>
                Minimum SUPPORTED: E.g.) v16, v16.5, v16.5.0
              </FormLabel>
              <Input
                onChange={(e) => {
                  setMinVerFilter(e.target.value);
                }}
              />
            </Box>
          </SimpleGrid>
        </FormControl>
      </Flex>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Module</Th>
            <Th>API</Th>
            <Th>Supported</Th>
            <Th>Backported</Th>
            <Th>URL</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredRecords.map(
            ({ module, api, supported, backported, url }) => (
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
                <Td>
                  <Link href={url} target="_blank">
                    {url}
                  </Link>
                </Td>
              </Tr>
            )
          )}
        </Tbody>
      </Table>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const moduleRecords = await getModuleRecords();
  const lastFetched = getFormattedDate();
  return { props: { records: moduleRecords, lastFetched } };
};

export default IndexPage;

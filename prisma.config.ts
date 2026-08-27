import { definePrismaConfig } from "prisma/config";

export default definePrismaConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DIRECT_URL,
  },
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});
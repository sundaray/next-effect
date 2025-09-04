import { AuthService } from "@/lib/services/auth-service";
import { DatabaseService } from "@/lib/services/database-service";
import { DbClientService } from "@/lib/services/dbClient-service";
import { EmailService } from "@/lib/services/email-service";
import { StorageService } from "@/lib/services/storage-service";
import { Layer, ManagedRuntime } from "effect";

const DatabaseServiceLayer = DatabaseService.Default;
const DbClientServiceLayer = DbClientService.Default;
const StorageServiceLayer = StorageService.Default;
const EmailServiceLayer = EmailService.Default;
const AuthServiceLayer = AuthService.Default;

const AppLayer = Layer.mergeAll(
  DatabaseServiceLayer,
  DbClientServiceLayer,
  StorageServiceLayer,
  AuthServiceLayer,
  EmailServiceLayer,
);

export const serverRuntime = ManagedRuntime.make(AppLayer);

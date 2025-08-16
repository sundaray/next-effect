import { Layer, ManagedRuntime } from "effect";
import { DatabaseService } from "@/lib/services/database-service";
import { DbClientService } from "@/lib/services/dbClient-service";
import { StorageService } from "@/lib/services/storage-service";
import { AuthService } from "@/lib/services/auth-service";
import { EmailService } from "@/lib/services/email-service";

const DatabaseServiceLayer = DatabaseService.Default;
const DbClientServiceLayer = DbClientService.Default;
const StorageServiceLayer = StorageService.Default;
const AuthServiceLayer = AuthService.Default;
const EmailServiceLayer = EmailService.Default;

const AppLayer = Layer.mergeAll(
  DatabaseServiceLayer,
  DbClientServiceLayer,
  StorageServiceLayer,
  AuthServiceLayer,
  EmailServiceLayer
);

export const serverRuntime = ManagedRuntime.make(AppLayer);

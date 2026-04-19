/**
 * Core type definitions for the Escalated Plugin SDK.
 */
export interface ConfigField {
    name: string;
    label: string;
    type: 'text' | 'password' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea' | 'json' | 'url';
    required?: boolean;
    help?: string;
    options?: Array<{
        value: string;
        label: string;
    }>;
    default?: unknown;
}
export interface PageDeclaration {
    route: string;
    component: string;
    layout?: 'admin' | 'agent' | 'public';
    capability?: string;
    menu?: MenuDeclaration;
}
export interface MenuDeclaration {
    label: string;
    section: 'admin' | 'agent';
    position: number;
    icon?: string;
}
export interface ComponentDeclaration {
    page: string;
    slot: string;
    component: string;
    props?: Record<string, unknown>;
    order?: number;
    capability?: string;
}
export interface WidgetDeclaration {
    component: string;
    label: string;
    size: 'full' | 'half' | 'quarter';
    order?: number;
    capability?: string;
    badge?: (ctx: PluginContext) => Promise<number | string | null>;
}
export interface EndpointHandler {
    capability?: string;
    handler: (ctx: PluginContext, req: EndpointRequest) => Promise<unknown>;
}
export interface EndpointRequest {
    body: unknown;
    params: Record<string, string>;
    query: Record<string, string>;
    headers: Record<string, string>;
}
export type EndpointDefinition = ((ctx: PluginContext, req: EndpointRequest) => Promise<unknown>) | EndpointHandler;
export type WebhookHandler = (ctx: PluginContext, req: EndpointRequest) => Promise<unknown>;
export type ActionHandler = (event: unknown, ctx: PluginContext) => Promise<void> | void;
export type FilterHandler<T = unknown> = (value: T, ctx: PluginContext) => T | Promise<T>;
export interface FilterDefinition<T = unknown> {
    priority?: number;
    handler: FilterHandler<T>;
}
export type FilterRegistration<T = unknown> = FilterHandler<T> | FilterDefinition<T>;
export type CronHandler = (ctx: PluginContext) => Promise<void>;
export interface PluginContext {
    config: ConfigStore;
    store: DataStore;
    http: HttpClient;
    broadcast: BroadcastClient;
    log: Logger;
    tickets: TicketRepository;
    replies: ReplyRepository;
    contacts: ContactRepository;
    tags: TagRepository;
    departments: DepartmentRepository;
    agents: AgentRepository;
    emit(hook: string, data: unknown): Promise<void>;
    currentUser(): Promise<User | null>;
}
export interface ConfigStore {
    get(key: string): Promise<unknown>;
    set(data: Record<string, unknown>): Promise<void>;
    all(): Promise<Record<string, unknown>>;
}
export interface DataStore {
    get(collection: string, key: string): Promise<unknown>;
    set(collection: string, key: string, value: unknown): Promise<void>;
    query(collection: string, filter: Record<string, unknown>, options?: QueryOptions): Promise<unknown[]>;
    insert(collection: string, data: Record<string, unknown>): Promise<unknown>;
    update(collection: string, key: string, data: Record<string, unknown>): Promise<unknown>;
    delete(collection: string, key: string): Promise<void>;
}
export interface QueryOptions {
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
}
export interface HttpClient {
    get(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
    post(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
    put(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
    delete(url: string, options?: HttpRequestOptions): Promise<HttpResponse>;
}
export interface HttpRequestOptions {
    headers?: Record<string, string>;
    json?: unknown;
    body?: string;
    timeout?: number;
}
export interface HttpResponse {
    status: number;
    headers: Record<string, string>;
    json(): Promise<unknown>;
    text(): Promise<string>;
}
export interface BroadcastClient {
    toChannel(channel: string, event: string, data: unknown): Promise<void>;
    toUser(userId: string | number, event: string, data: unknown): Promise<void>;
    toTicket(ticketId: string | number, event: string, data: unknown): Promise<void>;
}
export interface Logger {
    info(message: string, data?: unknown): void;
    warn(message: string, data?: unknown): void;
    error(message: string, data?: unknown): void;
    debug(message: string, data?: unknown): void;
}
export interface Ticket {
    id: string | number;
    title: string;
    status: string;
    priority: string;
    assigned_to?: string | number | null;
    department_id?: string | number | null;
    requester_id?: string | number | null;
    requester_type?: string | null;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}
export interface Reply {
    id: string | number;
    ticket_id: string | number;
    body: string;
    is_internal_note: boolean;
    author_id?: string | number | null;
    author_type?: string | null;
    created_at: string;
    updated_at: string;
}
export interface Contact {
    id: string | number;
    name: string;
    email: string;
}
export interface Tag {
    id: string | number;
    name: string;
    slug: string;
}
export interface Department {
    id: string | number;
    name: string;
    slug: string;
    is_active: boolean;
}
export interface Agent {
    id: string | number;
    name: string;
    email: string;
}
export interface User {
    id: string | number;
    name: string;
    email: string;
}
export interface TicketRepository {
    find(id: string | number): Promise<Ticket | null>;
    query(filter: Record<string, unknown>): Promise<Ticket[]>;
    create(data: Partial<Ticket>): Promise<Ticket>;
    update(id: string | number, data: Partial<Ticket>): Promise<Ticket>;
}
export interface ReplyRepository {
    find(id: string | number): Promise<Reply | null>;
    query(filter: Record<string, unknown>): Promise<Reply[]>;
    create(data: Partial<Reply>): Promise<Reply>;
}
export interface ContactRepository {
    find(id: string | number): Promise<Contact | null>;
    findByEmail(email: string): Promise<Contact | null>;
    create(data: Partial<Contact>): Promise<Contact>;
}
export interface TagRepository {
    all(): Promise<Tag[]>;
    create(data: {
        name: string;
    }): Promise<Tag>;
}
export interface DepartmentRepository {
    all(): Promise<Department[]>;
    find(id: string | number): Promise<Department | null>;
}
export interface AgentRepository {
    all(): Promise<Agent[]>;
    find(id: string | number): Promise<Agent | null>;
}
export interface PluginDefinition {
    name: string;
    version: string;
    description?: string;
    config?: ConfigField[];
    onActivate?: (ctx: PluginContext) => Promise<void>;
    onDeactivate?: (ctx: PluginContext) => Promise<void>;
    actions?: Record<string, ActionHandler>;
    filters?: Record<string, FilterRegistration>;
    pages?: PageDeclaration[];
    components?: ComponentDeclaration[];
    widgets?: WidgetDeclaration[];
    endpoints?: Record<string, EndpointDefinition>;
    webhooks?: Record<string, WebhookHandler>;
    cron?: Record<string, CronHandler>;
}
export interface PluginManifest {
    name: string;
    version: string;
    description?: string;
    config: ConfigField[];
    pages: PageDeclaration[];
    components: ComponentDeclaration[];
    widgets: Array<Omit<WidgetDeclaration, 'badge'> & {
        hasBadge: boolean;
    }>;
    actionHooks: string[];
    filterHooks: Array<{
        hook: string;
        priority: number;
    }>;
    endpoints: Array<{
        method: string;
        path: string;
        capability?: string;
    }>;
    webhooks: Array<{
        method: string;
        path: string;
    }>;
    cronSchedules: string[];
}
//# sourceMappingURL=types.d.ts.map
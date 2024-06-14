import { LookupFunction } from 'net';

export declare interface TracerOptions {
  /**
   * Whether to enable trace ID injection in log records to be able to correlate
   * traces with logs.
   * @default false
   */
  logInjection?: boolean;

  /**
   * Whether to enable startup logs.
   * @default true
   */
  startupLogs?: boolean;

  /**
   * The service name to be used for this program. If not set, the service name
   * will attempted to be inferred from package.json
   */
  service?: string;

  /**
   * Provide service name mappings for each plugin.
   */
  serviceMapping?: { [key: string]: string };

  /**
   * The url of the trace agent that the tracer will submit to.
   * Takes priority over hostname and port, if set.
   */
  url?: string;

  /**
   * The address of the trace agent that the tracer will submit to.
   * @default 'localhost'
   */
  hostname?: string;

  /**
   * The port of the trace agent that the tracer will submit to.
   * @default 8126
   */
  port?: number | string;

  /**
   * Whether to enable profiling.
   */
  profiling?: boolean;

  /**
   * Options specific for the Dogstatsd agent.
   */
  dogstatsd?: {
    /**
     * The hostname of the Dogstatsd agent that the metrics will submitted to.
     */
    hostname?: string;

    /**
     * The port of the Dogstatsd agent that the metrics will submitted to.
     * @default 8125
     */
    port?: number;
  };

  /**
   * Set an application’s environment e.g. prod, pre-prod, stage.
   */
  env?: string;

  /**
   * The version number of the application. If not set, the version
   * will attempted to be inferred from package.json.
   */
  version?: string;

  /**
   * Controls the ingestion sample rate (between 0 and 1) between the agent and the backend.
   */
  sampleRate?: number;

  /**
   * Global rate limit that is applied on the global sample rate and all rules,
   * and controls the ingestion rate limit between the agent and the backend.
   * Defaults to deferring the decision to the agent.
   */
  rateLimit?: number;

  /**
   * Sampling rules to apply to priority samplin. Each rule is a JSON,
   * consisting of `service` and `name`, which are regexes to match against
   * a trace's `service` and `name`, and a corresponding `sampleRate`. If not
   * specified, will defer to global sampling rate for all spans.
   * @default []
   */
  samplingRules?: SamplingRule[];

  /**
   * Span sampling rules that take effect when the enclosing trace is dropped, to ingest single spans
   * @default []
   */
  spanSamplingRules?: SpanSamplingRule[];

  /**
   * Interval in milliseconds at which the tracer will submit traces to the agent.
   * @default 2000
   */
  flushInterval?: number;

  /**
   *  Number of spans before partially exporting a trace. This prevents keeping all the spans in memory for very large traces.
   * @default 1000
   */
  flushMinSpans?: number;

  /**
   * Whether to enable runtime metrics.
   * @default false
   */
  runtimeMetrics?: boolean;

  /**
   * Custom function for DNS lookups when sending requests to the agent.
   * @default dns.lookup()
   */
  lookup?: LookupFunction;

  /**
   * Protocol version to use for requests to the agent. The version configured must be supported by the agent version installed or all traces will be dropped.
   * @default 0.4
   */
  protocolVersion?: string;

  /**
   * Deprecated in favor of the global versions of the variables provided under this option
   *
   * @deprecated
   * @hidden
   */
  ingestion?: {
    /**
     * Controls the ingestion sample rate (between 0 and 1) between the agent and the backend.
     */
    sampleRate?: number;

    /**
     * Controls the ingestion rate limit between the agent and the backend. Defaults to deferring the decision to the agent.
     */
    rateLimit?: number;
  };

  /**
   * Experimental features can be enabled individually using key / value pairs.
   * @default {}
   */
  experimental?: {
    b3?: boolean;
    traceparent?: boolean;

    /**
     * Whether to add an auto-generated `runtime-id` tag to metrics.
     * @default false
     */
    runtimeId?: boolean;

    /**
     * Whether to write traces to log output or agentless, rather than send to an agent
     * @default false
     */
    exporter?: 'log' | 'agent' | 'datadog';

    /**
     * Whether to enable the experimental `getRumData` method.
     * @default false
     */
    enableGetRumData?: boolean;

    /**
     * Configuration of the IAST. Can be a boolean as an alias to `iast.enabled`.
     */
    iast?:
      | boolean
      | {
          /**
           * Whether to enable IAST.
           * @default false
           */
          enabled?: boolean;
          /**
           * Controls the percentage of requests that iast will analyze
           * @default 30
           */
          requestSampling?: number;
          /**
           * Controls how many request can be analyzing code vulnerabilities at the same time
           * @default 2
           */
          maxConcurrentRequests?: number;
          /**
           * Controls how many code vulnerabilities can be detected in the same request
           * @default 2
           */
          maxContextOperations?: number;
        };
  };

  /**
   * Whether to load all built-in plugins.
   * @default true
   */
  plugins?: boolean;

  /**
   * Custom logger to be used by the tracer (if debug = true),
   * should support error(), warn(), info(), and debug() methods
   * see https://datadog.github.io/dd-trace-js/#custom-logging
   */
  logger?: {
    error: (err: Error | string) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
    debug: (message: string) => void;
  };

  /**
   * Global tags that should be assigned to every span.
   */
  tags?: { [key: string]: any };

  /**
   * Specifies which scope implementation to use. The default is to use the best
   * implementation for the runtime. Only change this if you know what you are
   * doing.
   */
  scope?: 'async_hooks' | 'async_local_storage' | 'async_resource' | 'sync' | 'noop';

  /**
   * Whether to report the hostname of the service host. This is used when the agent is deployed on a different host and cannot determine the hostname automatically.
   * @default false
   */
  reportHostname?: boolean;

  /**
   * A string representing the minimum tracer log level to use when debug logging is enabled
   * @default 'debug'
   */
  logLevel?: 'error' | 'debug';

  /**
   * If false, require a parent in order to trace.
   * @default true
   */
  orphanable?: boolean;

  /**
   * Enables DBM to APM link using tag injection.
   * @default 'disabled'
   */
  dbmPropagationMode?: 'disabled' | 'service' | 'full';

  /**
   * Configuration of the AppSec protection. Can be a boolean as an alias to `appsec.enabled`.
   */
  appsec?:
    | boolean
    | {
        /**
         * Whether to enable AppSec.
         * @default false
         */
        enabled?: boolean;

        /**
         * Specifies a path to a custom rules file.
         */
        rules?: string;

        /**
         * Controls the maximum amount of traces sampled by AppSec attacks, per second.
         * @default 100
         */
        rateLimit?: number;

        /**
         * Controls the maximum amount of time in microseconds the WAF is allowed to run synchronously for.
         * @default 5000
         */
        wafTimeout?: number;

        /**
         * Specifies a regex that will redact sensitive data by its key in attack reports.
         */
        obfuscatorKeyRegex?: string;

        /**
         * Specifies a regex that will redact sensitive data by its value in attack reports.
         */
        obfuscatorValueRegex?: string;

        /**
         * Specifies a path to a custom blocking template html file.
         */
        blockedTemplateHtml?: string;

        /**
         * Specifies a path to a custom blocking template json file.
         */
        blockedTemplateJson?: string;
      };

  /**
   * Configuration of ASM Remote Configuration
   */
  remoteConfig?: {
    /**
     * Specifies the remote configuration polling interval in seconds
     * @default 5
     */
    pollInterval?: number;
  };

  /**
   * Whether to enable client IP collection from relevant IP headers
   * @default false
   */
  clientIpEnabled?: boolean;

  /**
   * Custom header name to source the http.client_ip tag from.
   */
  clientIpHeader?: string;

  /**
   * The selection and priority order of context propagation injection and extraction mechanisms.
   */
  propagationStyle?: string[] | PropagationStyle;
}

export declare interface SamplingRule {
  /**
   * Sampling rate for this rule.
   */
  sampleRate: number;

  /**
   * Service on which to apply this rule. The rule will apply to all services if not provided.
   */
  service?: string | RegExp;

  /**
   * Operation name on which to apply this rule. The rule will apply to all operation names if not provided.
   */
  name?: string | RegExp;
}

export declare interface PropagationStyle {
  /**
   * Selection of context propagation injection mechanisms.
   */
  inject: string[];

  /**
   * Selection and priority order of context propagation extraction mechanisms.
   */
  extract: string[];
}

export declare interface SpanSamplingRule {
  /**
   * Sampling rate for this rule. Will default to 1.0 (always) if not provided.
   */
  sampleRate?: number;

  /**
   * Maximum number of spans matching a span sampling rule to be allowed per second.
   */
  maxPerSecond?: number;

  /**
   * Service name or pattern on which to apply this rule. The rule will apply to all services if not provided.
   */
  service?: string;

  /**
   * Operation name or pattern on which to apply this rule. The rule will apply to all operation names if not provided.
   */
  name?: string;
}

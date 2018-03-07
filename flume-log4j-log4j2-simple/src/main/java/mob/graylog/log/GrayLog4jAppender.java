package mob.graylog.log;


import com.fasterxml.jackson.core.io.JsonStringEncoder;
import com.lamfire.utils.StringUtils;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericRecord;
import org.apache.avro.io.BinaryEncoder;
import org.apache.avro.io.DatumWriter;
import org.apache.avro.io.EncoderFactory;
import org.apache.avro.reflect.ReflectData;
import org.apache.avro.reflect.ReflectDatumWriter;
import org.apache.avro.specific.SpecificRecord;
import org.apache.flume.Event;
import org.apache.flume.EventDeliveryException;
import org.apache.flume.FlumeException;
import org.apache.flume.api.RpcClient;
import org.apache.flume.api.RpcClientConfigurationConstants;
import org.apache.flume.api.RpcClientFactory;
import org.apache.flume.clients.log4jappender.Log4jAvroHeaders;
import org.apache.flume.event.EventBuilder;
import org.apache.log4j.helpers.LogLog;
import org.apache.log4j.spi.LoggingEvent;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class GrayLog4jAppender extends org.apache.flume.clients.log4jappender.Log4jAppender {

    private String originHost;
    // private String topic_flume_graylog;
    private String hostName;
    private int port;
    private boolean unsafeMode = false;
    private long timeout;
    private boolean avroReflectionEnabled;
    private String avroSchemaUrl;
    RpcClient rpcClient;
    private Schema schema;
    private ByteArrayOutputStream out;
    private DatumWriter<Object> writer;
    private BinaryEncoder encoder;
    //logstash
    private String es_index_ = "_default_mob_";
    private String es_type_ = "_default_type_";
    private String additionalFields;
    private Map<String, String> additionalFieldsMap = new HashMap<String, String>();


    public GrayLog4jAppender() {
        this.timeout = RpcClientConfigurationConstants.DEFAULT_REQUEST_TIMEOUT_MILLIS;
        this.rpcClient = null;
    }

    public GrayLog4jAppender(String hostName, int port) {
        this.timeout = RpcClientConfigurationConstants.DEFAULT_REQUEST_TIMEOUT_MILLIS;
        this.rpcClient = null;
        this.hostName = hostName;
        this.port = port;
    }

    private void init() {
        if (!StringUtils.isEmpty(additionalFields) && additionalFieldsMap.isEmpty()) {
            try {
                String[] kvs = additionalFields.split(",");
                if (kvs != null && kvs.length > 0) {
                    for (String kv : kvs) {
                        String[] kv_tmp = kv.split("=");
                        String key =kv_tmp[0];
                        if(!StringUtils.isEmpty(key)){
                            additionalFieldsMap.put(key, kv_tmp[1]);
                        }
                    }
                }
            } catch (Exception e) {
                LogLog.error(e.getMessage());
            }
        }
    }

    static String formatThrowable(Throwable throwable) {
        StringWriter sw = new StringWriter(2048);
        PrintWriter pw = new PrintWriter(sw);
        throwable.printStackTrace(pw);
        pw.flush();
        return sw.toString();
    }

    private static String getSeverity(int level) {
        switch (level) {
            case 1:
                return "DEBUG";
            case 2:
                return "DEBUG";
            case 3:
                return "DEBUG";
            case 4:
                return "INFO";
            case 5:
                return "WARNING";
            case 6:
                return "ERROR";
            case 7:
                return "ALERT";
            case 8:
                return "EMERG";
            default:
                return "DEBUG";
        }
    }

    private static final BigDecimal TIME_DIVISOR = new BigDecimal(1000);

    static String formatTimestamp(long timeMillis) {
        return (new BigDecimal(timeMillis)).divide(TIME_DIVISOR).toPlainString();
    }

    @Override
    public synchronized void append(LoggingEvent event) throws FlumeException {

        if (rpcClient == null || !this.rpcClient.isActive()) {
            this.reconnect();
        }
        if (rpcClient == null) {
            String errorMsg = "Cannot Append to Appender! Appender either closed or not setup correctly!";
            LogLog.error(errorMsg);
            if (!this.unsafeMode) {
                throw new FlumeException(errorMsg);
            }
        } else {
            init();

            if (!this.rpcClient.isActive()) {
                this.reconnect();
            }

            Map<String, String> hdrs = new HashMap();
            hdrs.put(Log4jAvroHeaders.LOGGER_NAME.toString(), event.getLoggerName());
            hdrs.put(Log4jAvroHeaders.TIMESTAMP.toString(), String.valueOf(event.timeStamp));
            hdrs.put(Log4jAvroHeaders.LOG_LEVEL.toString(), String.valueOf(event.getLevel().toInt()));
            Object message = event.getMessage();
            Event flumeEvent;
            if (message instanceof GenericRecord) {
                GenericRecord record = (GenericRecord) message;
                this.populateAvroHeaders(hdrs, record.getSchema(), message);
                flumeEvent = EventBuilder.withBody(this.serialize(record, record.getSchema()), hdrs);
            } else if (!(message instanceof SpecificRecord) && !this.avroReflectionEnabled) {

                hdrs.put(Log4jAvroHeaders.MESSAGE_ENCODING.toString(), "UTF8");
                //按照log4j.properties配置格式化日志
                String short_msg = message.toString();
                String msg = short_msg + "\r\n";

                String full_message = null;
                //A:data--2-->jsop
                if (layout.ignoresThrowable() && event.getThrowableInformation() != null) {
                    Throwable s = event.getThrowableInformation().getThrowable();
                    full_message = formatThrowable(s);
                }
                StringBuffer builder = new StringBuffer();
                builder.append('{');
                builder.append("\"es_index_\":\"").append(es_index_).append("\",");
                builder.append("\"es_type_\":\"").append(es_type_).append("\",");
                builder.append("\"version\":\"1.1\",");
                builder.append("\"host\":\"").append(hostName).append("\",");
                builder.append("\"originHost\":\"").append(originHost).append("\",");
                builder.append("\"timestamp\":").append(formatTimestamp(event.getTimeStamp())).append(',');
                builder.append("\"level\":\"").append(getSeverity(event.getLevel().getSyslogEquivalent())).append("\",");
                if (event.getThreadName() != null) {
                    builder.append("\"_thread\":\"").append(event.getThreadName()).append("\",");
                }
                if (event.getLoggerName() != null) {
                    builder.append("\"_logger\":\"").append(event.getLoggerName()).append("\",");
                }
                if(additionalFieldsMap.size()>0){
                    for(Map.Entry<String,String> kv:additionalFieldsMap.entrySet()){
                        builder.append("\""+ kv.getKey()+"\":\"").append(kv.getValue()).append("\",");
                    }
                }
                JsonStringEncoder jsonEncoder = JsonStringEncoder.getInstance();

                if (full_message != null) {
                    builder.append("\"full_message\":\"").append(jsonEncoder.quoteAsString(full_message)).append("\",");
                }
                builder.append("\"short_message\":\"").append(short_msg).append("\"");
                builder.append('}');
                flumeEvent = EventBuilder.withBody(builder.toString(), Charset.forName("UTF8"), hdrs);
            } else {
                Schema schema = ReflectData.get().getSchema(message.getClass());
                this.populateAvroHeaders(hdrs, schema, message);
                flumeEvent = EventBuilder.withBody(this.serialize(message, schema), hdrs);

            }

            try {
                this.rpcClient.append(flumeEvent);
            } catch (EventDeliveryException var7) {
                String msg = "Flume append() failed.";
                LogLog.error(msg);
                if (!this.unsafeMode) {
                    throw new FlumeException(msg + " Exception follows.", var7);
                }
            }
        }
    }

    protected void populateAvroHeaders(Map<String, String> hdrs, Schema schema, Object message) {
        if (this.avroSchemaUrl != null) {
            hdrs.put(Log4jAvroHeaders.AVRO_SCHEMA_URL.toString(), this.avroSchemaUrl);
        } else {
            LogLog.warn("Cannot find ID for schema. Adding header for schema, which may be inefficient. Consider setting up an Avro Schema Cache.");
            hdrs.put(Log4jAvroHeaders.AVRO_SCHEMA_LITERAL.toString(), schema.toString());
        }
    }

    private byte[] serialize(Object datum, Schema datumSchema) throws FlumeException {
        if (this.schema == null || !datumSchema.equals(this.schema)) {
            this.schema = datumSchema;
            this.out = new ByteArrayOutputStream();
            this.writer = new ReflectDatumWriter(this.schema);
            this.encoder = EncoderFactory.get().binaryEncoder(this.out, (BinaryEncoder) null);
        }

        this.out.reset();

        try {
            this.writer.write(datum, this.encoder);
            this.encoder.flush();
            return this.out.toByteArray();
        } catch (IOException var4) {
            throw new FlumeException(var4);
        }
    }

    public synchronized void close() throws FlumeException {
        if (this.rpcClient != null) {
            try {
                this.rpcClient.close();
                return;
            } catch (FlumeException var5) {
                LogLog.error("Error while trying to close RpcClient.", var5);
                if (!this.unsafeMode) {
                    throw var5;
                }
            } finally {
                this.rpcClient = null;
            }

        } else {
            String errorMsg = "Flume log4jappender already closed!";
            LogLog.error(errorMsg);
            if (!this.unsafeMode) {
                throw new FlumeException(errorMsg);
            }
        }
    }

    public boolean requiresLayout() {
        return true;
    }


    public void setUnsafeMode(boolean unsafeMode) {
        this.unsafeMode = unsafeMode;
    }

    public boolean getUnsafeMode() {
        return this.unsafeMode;
    }

    public void setTimeout(long timeout) {
        this.timeout = timeout;
    }

    public long getTimeout() {
        return this.timeout;
    }

    public void setAvroReflectionEnabled(boolean avroReflectionEnabled) {
        this.avroReflectionEnabled = avroReflectionEnabled;
    }


    public void setAvroSchemaUrl(String avroSchemaUrl) {
        this.avroSchemaUrl = avroSchemaUrl;
    }

    public void activateOptions() throws FlumeException {
        Properties props = new Properties();
        props.setProperty("hosts", "h1");
        props.setProperty("hosts.h1", this.hostName + ":" + this.port);
        props.setProperty("connect-timeout", String.valueOf(this.timeout));
        props.setProperty("request-timeout", String.valueOf(this.timeout));
        props.setProperty("max-attempts", "3");

        try {
            this.rpcClient = RpcClientFactory.getInstance(props);
            if (this.layout != null) {
                this.layout.activateOptions();
            }

        } catch (FlumeException var4) {
            String errormsg = "RPC client creation failed! " + var4.getMessage();
            LogLog.error(errormsg);
            if (!this.unsafeMode) {
                throw var4;
            }
        }
    }

    private final void reconnect() throws FlumeException {
        this.close();
        this.activateOptions();
    }

    public void reportError(String message, Exception exception) {
        this.errorHandler.error(message, exception, 0);
    }


    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public String getOriginHost() {
        return originHost;

    }

    private String version;

    public String getVersion() {
        return this.version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    private String mdcProfiling;
    private String maximumMessageSize;
    private String timestampPattern;

    public String getMdcProfiling() {
        return mdcProfiling;
    }

    public void setMdcProfiling(String mdcProfiling) {
        this.mdcProfiling = mdcProfiling;
    }

    public String getMaximumMessageSize() {
        return maximumMessageSize;
    }

    public void setMaximumMessageSize(String maximumMessageSize) {
        this.maximumMessageSize = maximumMessageSize;
    }

    public String getTimestampPattern() {
        return timestampPattern;
    }

    public void setTimestampPattern(String timestampPattern) {
        this.timestampPattern = timestampPattern;
    }

    public void setOriginHost(String originHost) {
        this.originHost = originHost;
    }

    public String getes_index_() {
        return es_index_;
    }

    public void setes_index_(String es_index_) {
        this.es_index_ = es_index_;
    }

    public String getes_type_() {
        return es_type_;
    }

    public void setes_type_(String es_type_) {
        this.es_type_ = es_type_;
    }

    public String getAdditionalFields() {
        return additionalFields;
    }

    public void setAdditionalFields(String additionalFields) {
        this.additionalFields = additionalFields;
    }
}

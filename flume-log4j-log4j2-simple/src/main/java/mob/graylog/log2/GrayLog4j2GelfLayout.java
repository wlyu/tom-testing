package mob.graylog.log2;//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by Fernflower decompiler)
//


import com.fasterxml.jackson.core.io.JsonStringEncoder;
import org.apache.logging.log4j.core.LogEvent;
import org.apache.logging.log4j.core.config.plugins.Plugin;
import org.apache.logging.log4j.core.config.plugins.PluginAttribute;
import org.apache.logging.log4j.core.config.plugins.PluginElement;
import org.apache.logging.log4j.core.config.plugins.PluginFactory;
import org.apache.logging.log4j.core.layout.AbstractStringLayout;
import org.apache.logging.log4j.core.util.KeyValuePair;
import org.apache.logging.log4j.status.StatusLogger;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.zip.DeflaterOutputStream;
import java.util.zip.GZIPOutputStream;

/**
 * 复制的官方的GelfLayout
 *
 * 如果需要扩展可自定义字段
 */
@Plugin(
        name = "GrayLog4j2GelfLayout",
        category = "Core",
        elementType = "layout",
        printObject = true
)
public final class GrayLog4j2GelfLayout extends AbstractStringLayout {
    private static final char C = ',';
    private static final int COMPRESSION_THRESHOLD = 1024;
    private static final char Q = '"';
    private static final String QC = "\",";
    private static final String QU = "\"_";
    private static final long serialVersionUID = 1L;
    private static final BigDecimal TIME_DIVISOR = new BigDecimal(1000);
    private final KeyValuePair[] additionalFields;
    private final int compressionThreshold;
    private final GrayLog4j2GelfLayout.CompressionType compressionType;
    private final String host;

    public GrayLog4j2GelfLayout(String host, KeyValuePair[] additionalFields,
                       GrayLog4j2GelfLayout.CompressionType compressionType, int compressionThreshold) {
        super(StandardCharsets.UTF_8);
        this.host = host;
        this.additionalFields = additionalFields;
        this.compressionType = compressionType;
        this.compressionThreshold = compressionThreshold;
    }

    @PluginFactory
    public static GrayLog4j2GelfLayout createLayout(@PluginAttribute("host") String host,
                                           @PluginElement("AdditionalField") KeyValuePair[] additionalFields,
                                           @PluginAttribute(value = "compressionType",defaultString = "GZIP") GrayLog4j2GelfLayout.CompressionType compressionType,
                                           @PluginAttribute(value = "compressionThreshold",defaultInt = 1024) int compressionThreshold) {
        return new GrayLog4j2GelfLayout(host, additionalFields, compressionType, compressionThreshold);
    }

    static String formatThrowable(Throwable throwable) {
        StringWriter sw = new StringWriter(2048);
        PrintWriter pw = new PrintWriter(sw);
        throwable.printStackTrace(pw);
        pw.flush();
        return sw.toString();
    }

    static String formatTimestamp(long timeMillis) {
        return (new BigDecimal(timeMillis)).divide(TIME_DIVISOR).toPlainString();
    }

    private byte[] compress(byte[] bytes) {
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream(this.compressionThreshold / 8);
            DeflaterOutputStream stream = this.compressionType.createDeflaterOutputStream(baos);
            Throwable var4 = null;

            byte[] var5;
            try {
                if(stream != null) {
                    stream.write(bytes);
                    stream.finish();
                    return baos.toByteArray();
                }

                var5 = bytes;
            } catch (Throwable var16) {
                var4 = var16;
                throw var16;
            } finally {
                if(stream != null) {
                    if(var4 != null) {
                        try {
                            stream.close();
                        } catch (Throwable var15) {
                            var4.addSuppressed(var15);
                        }
                    } else {
                        stream.close();
                    }
                }

            }

            return var5;
        } catch (IOException var18) {
            StatusLogger.getLogger().error(var18);
            return bytes;
        }
    }

    public Map<String, String> getContentFormat() {
        return Collections.emptyMap();
    }

    public String getContentType() {
        return "application/json; charset=" + this.getCharset();
    }

    public byte[] toByteArray(LogEvent event) {
        byte[] bytes = this.getBytes(this.toSerializable(event));
        return bytes;
    }

    public String toSerializable(LogEvent event) {
        StringBuilder builder = this.getStringBuilder();
        JsonStringEncoder jsonEncoder = JsonStringEncoder.getInstance();
        builder.append('{');
        builder.append("\"version\":\"1.1\",");
        builder.append("\"timestamp\":").append(formatTimestamp(event.getTimeMillis())).append(',');
        builder.append("\"level\":\"").append(event.getLevel().name()).append("\",");



        if(event.getThreadName() != null) {
            builder.append("\"_thread\":\"").append(jsonEncoder.quoteAsString(event.getThreadName())).append("\",");
        }

        if(event.getLoggerName() != null) {
            builder.append("\"_logger\":\"").append(jsonEncoder.quoteAsString(event.getLoggerName())).append("\",");
        }

        KeyValuePair[] arr$ = this.additionalFields;
        int len$ = arr$.length;

        for(int i$ = 0; i$ < len$; ++i$) {
            KeyValuePair additionalField = arr$[i$];
            builder.append("\"").append(jsonEncoder.quoteAsString(additionalField.getKey())).append("\":\"").append(jsonEncoder.quoteAsString(this.toNullSafeString(additionalField.getValue()))).append("\",");
        }

        Iterator i$ = event.getContextMap().entrySet().iterator();

        while(i$.hasNext()) {
            Entry<String, String> entry = (Entry)i$.next();
            builder.append("\"_").append(jsonEncoder.quoteAsString((String)entry.getKey())).append("\":\"").append(jsonEncoder.quoteAsString(this.toNullSafeString((String)entry.getValue()))).append("\",");
        }

        if(event.getThrown() != null) {
            builder.append("\"full_message\":\"").append(jsonEncoder.quoteAsString(formatThrowable(event.getThrown()))).append("\",");
        }

        builder.append("\"short_message\":\"").append(jsonEncoder.quoteAsString(this.toNullSafeString(event.getMessage().getFormattedMessage()))).append('"');
        builder.append('}');
        return builder.toString();
    }

    private String toNullSafeString(String s) {
        return s == null?"":s;
    }

    public static enum CompressionType {
        GZIP {
            public DeflaterOutputStream createDeflaterOutputStream(OutputStream os) throws IOException {
                return new GZIPOutputStream(os);
            }
        },
        ZLIB {
            public DeflaterOutputStream createDeflaterOutputStream(OutputStream os) throws IOException {
                return new DeflaterOutputStream(os);
            }
        },
        OFF {
            public DeflaterOutputStream createDeflaterOutputStream(OutputStream os) throws IOException {
                return null;
            }
        };

        private CompressionType() {
        }

        public abstract DeflaterOutputStream createDeflaterOutputStream(OutputStream var1) throws IOException;
    }
}

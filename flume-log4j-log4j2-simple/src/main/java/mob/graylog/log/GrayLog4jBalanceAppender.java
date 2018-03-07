package mob.graylog.log;

import java.util.Properties;

import org.apache.commons.lang.StringUtils;
import org.apache.flume.FlumeException;
import org.apache.flume.api.RpcClientConfigurationConstants;
import org.apache.flume.api.RpcClientFactory;
import org.apache.flume.api.RpcClientFactory.ClientType;
import org.apache.log4j.helpers.LogLog;
import org.apache.log4j.spi.LoggingEvent;


public class GrayLog4jBalanceAppender extends GrayLog4jAppender {

  private String hosts;
  private String maxAttempts;
  private boolean configured = false;
  private String selector;
  private String maxBackoff;

  public void setHosts(String hostNames) {
    this.hosts = hostNames;
  }

  public void setMaxAttempts(String maxAttempts) {
    this.maxAttempts = maxAttempts;
  }

  public String getSelector() {
    return selector;
  }

  public void setSelector(String selector) {
    this.selector = selector;
  }

  public String getMaxBackoff() {
    return maxBackoff;
  }

  public void setMaxBackoff(String maxBackoff) {
    this.maxBackoff = maxBackoff;
  }

  /*@Override
  public synchronized void append(LoggingEvent event) {
    if(!configured) {
      String errorMsg = "Flume Log4jAppender not configured correctly! Cannot send events to Flume.";
      LogLog.error(errorMsg);
      if(getUnsafeMode()) {
        return;
      }
      throw new FlumeException(errorMsg);
    }
    super.append(event);
  }*/

  /**
   *
   * @throws FlumeException
   *           if the FailoverRpcClient cannot be instantiated.
   */
  @Override
  public void activateOptions() throws FlumeException {
    try {
      final Properties properties = getProperties(hosts, maxAttempts, getTimeout());
      rpcClient = RpcClientFactory.getInstance(properties);
      if(layout != null) {
        layout.activateOptions();
      }
      configured = true;
    } catch (Exception e) {
      String errormsg = "RPC client creation failed! " + e.getMessage();
      LogLog.error(errormsg);
      if (getUnsafeMode()) {
        return;
      }
      throw new FlumeException(e);
    }

  }

  //配置必要的参数
  /**
  */
  private Properties getProperties(String hosts, String maxAttempts, long timeout) throws FlumeException {

    if (StringUtils.isEmpty(hosts)) {
      throw new FlumeException("hosts must not be null");
    }

    Properties props = new Properties();
    String[] hostsAndPorts = hosts.split(",");
    StringBuilder names = new StringBuilder();
    for (int i = 0; i < hostsAndPorts.length; i++) {
      String hostAndPort = hostsAndPorts[i];
      String name = "h" + i;
      props.setProperty(RpcClientConfigurationConstants.CONFIG_HOSTS_PREFIX + name,
          hostAndPort);
      names.append(name).append(" ");
    }
    props.put(RpcClientConfigurationConstants.CONFIG_HOSTS, names.toString());
    props.put(RpcClientConfigurationConstants.CONFIG_CLIENT_TYPE,
        ClientType.DEFAULT_FAILOVER.toString());

    if (StringUtils.isEmpty(maxAttempts)) {
      throw new FlumeException("hosts must not be null");
    }

    props.put(RpcClientConfigurationConstants.CONFIG_MAX_ATTEMPTS, maxAttempts);

    props.setProperty(RpcClientConfigurationConstants.CONFIG_CONNECT_TIMEOUT,
      String.valueOf(timeout));
    props.setProperty(RpcClientConfigurationConstants.CONFIG_REQUEST_TIMEOUT,
      String.valueOf(timeout));
    return props;
  }
}
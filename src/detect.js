(function($) {
    function detect(ua) {
        var os = false, match = [],
            agentRxs = {
                android: /(Android)\s+(\d+)\.([\d.]+)/,
                iphone: /(iPhone|iPod).*OS\s+(\d+)\.([\d.]+)/,
                ipad: /(iPad).*OS\s+(\d+)_([\d_]+)/,
                webos: /(webOS)\/(\d+)\.([\d.]+)/,
                blackberry: /(BlackBerry).*?Version\/(\d+)\.([\d.]+)/
            };
        for (var agent in agentRxs) {
            match = ua.match(agentRxs[agent]);
            if (match) {
                os = {};
                os.name = agent.toLowerCase();
                os[os.name] = true;
                os.majorVersion = match[2];
                os.minorVersion = match[3].replace(/_/g, '.');
                os.ios = (agent in { iphone:0, ipod:0, ipad:0 });
                
                break;
            }
        }
        return os;
    }

    $.os = detect(navigator.userAgent);
    $.__detect = detect;

})(Zepto);

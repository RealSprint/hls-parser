import * as utils from '../../../helpers/utils';
import * as HLS from '../../../../src/';
import { MediaPlaylist } from '../../../../src/types';

describe('Apple-Low-Latency/New_Media_Playlist_Tags_for_Low-Latency_HLS', () => {
    // All Media Segment tags except for EXT-X-DATERANGE, EXT-X-BYTERANGE,
    // and EXT-X-GAP that are applied to a Parent Segment must appear before
    // the first EXT-X-PART tag of the Parent Segment. These tags include
    // EXT-X-MAP, EXT-X-DISCONTINUITY, and EXT-X-KEY.
    test('#EXT-X-PART_01', () => {
        utils.bothPass(`
          #EXTM3U
          #EXT-X-VERSION:6
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-MAP:URI="http://example.com/map-1"
          #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.17,URI="fs241.mp4",BYTERANGE=20000@20000
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=40000,BYTERANGE-LENGTH=20000
        `);
        utils.parseFail(`
          #EXTM3U
          #EXT-X-VERSION:6
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.17,URI="fs241.mp4",BYTERANGE=20000@20000
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=40000,BYTERANGE-LENGTH=20000
          #EXT-X-MAP:URI="http://example.com/map-1"
        `);
        utils.bothPass(`
          #EXTM3U
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-DISCONTINUITY
          #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.17,URI="fs241.mp4",BYTERANGE=20000@20000
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=40000,BYTERANGE-LENGTH=20000
        `);
        utils.parseFail(`
          #EXTM3U
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.17,URI="fs241.mp4",BYTERANGE=20000@20000
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=40000,BYTERANGE-LENGTH=20000
          #EXT-X-DISCONTINUITY
        `);
        utils.bothPass(`
          #EXTM3U
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-KEY:METHOD=AES-128,URI="http://example.com"
          #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.17,URI="fs241.mp4",BYTERANGE=20000@20000
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=40000,BYTERANGE-LENGTH=20000
        `);
        utils.parseFail(`
          #EXTM3U
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.17,URI="fs241.mp4",BYTERANGE=20000@20000
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=40000,BYTERANGE-LENGTH=20000
          #EXT-X-KEY:METHOD=AES-128,URI="http://example.com"
        `);
    });

    // Remove EXT-X-PART tags from the Playlist after they are greater than
    // three target durations from the end of the Playlist. Partial Segments
    // are useful for navigating close to the live edge, after which their
    // presence does not justify the increase in the Playlist size and the
    // responsibility of retaining the parallel Partial Segment stream on the server.
    test('#EXT-X-PART_02', () => {
        utils.bothPass(`
          #EXTM3U
          #EXT-X-TARGETDURATION:1
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.9
          #EXT-X-PART-INF:PART-TARGET=0.4
          #EXTINF:1,
          fs240.mp4
          #EXT-X-PART:DURATION=0.34,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.34,URI="fs241.mp4",BYTERANGE=23000@20000
          #EXT-X-PART:DURATION=0.4,URI="fs241.mp4",BYTERANGE=18000@43000
          #EXTINF:1,
          fs241.mp4
          #EXT-X-PART:DURATION=0.34,URI="fs242.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.34,URI="fs242.mp4",BYTERANGE=23000@20000
          #EXT-X-PART:DURATION=0.4,URI="fs242.mp4",BYTERANGE=18000@43000
          #EXTINF:1,
          fs242.mp4
          #EXT-X-PART:DURATION=0.34,URI="fs243.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.34,URI="fs243.mp4",BYTERANGE=23000@20000
          #EXT-X-PART:DURATION=0.4,URI="fs243.mp4",BYTERANGE=18000@43000
          #EXTINF:1,
          fs243.mp4
        `);
        utils.parseFail(`
          #EXTM3U
          #EXT-X-TARGETDURATION:1
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.9
          #EXT-X-PART-INF:PART-TARGET=0.4
          #EXTINF:1,
          fs240.mp4
          #EXT-X-PART:DURATION=0.34,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.34,URI="fs241.mp4",BYTERANGE=23000@20000
          #EXT-X-PART:DURATION=0.4,URI="fs241.mp4",BYTERANGE=18000@43000
          #EXTINF:1,
          fs241.mp4
          #EXT-X-PART:DURATION=0.34,URI="fs242.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.34,URI="fs242.mp4",BYTERANGE=23000@20000
          #EXT-X-PART:DURATION=0.4,URI="fs242.mp4",BYTERANGE=18000@43000
          #EXTINF:1,
          fs242.mp4
          #EXT-X-PART:DURATION=0.34,URI="fs243.mp4",BYTERANGE=20000@0
          #EXT-X-PART:DURATION=0.34,URI="fs243.mp4",BYTERANGE=23000@20000
          #EXT-X-PART:DURATION=0.4,URI="fs243.mp4",BYTERANGE=18000@43000
          #EXTINF:1,
          fs243.mp4
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs244.mp4",BYTERANGE-START=0,BYTERANGE-LENGTH=20000
        `);
    });

    // DURATION=<s>: (mandatory) Indicates the duration of the Partial Segment
    // in floating-point seconds.
    test('#EXT-X-PART_03', () => {
        utils.bothPass(`
          #EXTM3U
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-PART:DURATION=0.17,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=20000,BYTERANGE-LENGTH=20000
        `);
        utils.parseFail(`
          #EXTM3U
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-PART:URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=20000,BYTERANGE-LENGTH=20000
        `);
    });

    // URI=<url>: (mandatory) Indicates the URI for the Partial Segment.
    test('#EXT-X-PART_04', () => {
        utils.bothPass(`
          #EXTM3U
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-PART:DURATION=0.17,URI="fs241.mp4",BYTERANGE=20000@0
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=20000,BYTERANGE-LENGTH=20000
        `);
        utils.parseFail(`
          #EXTM3U
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.6
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-PART:DURATION=0.17,BYTERANGE=20000@0
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=20000,BYTERANGE-LENGTH=20000
        `);
    });

    test('#EXT-X-PART_05', () => {
        const { segments } = HLS.parse(`
          #EXTM3U
          #EXT-X-TARGETDURATION:2
          #EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,CAN-SKIP-UNTIL=12.0,HOLD-BACK=6.0,PART-HOLD-BACK=0.2
          #EXT-X-PART-INF:PART-TARGET=0.2
          #EXTINF:2,
          fs240.mp4
          #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@0,INDEPENDENT=YES,GAP=YES
          #EXT-X-PART:DURATION=0.2,URI="fs241.mp4",BYTERANGE=20000@20000,INDEPENDENT=YES,GAP=YES
          #EXT-X-PRELOAD-HINT:TYPE=PART,URI="fs241.mp4",BYTERANGE-START=40000,BYTERANGE-LENGTH=20000
        `) as MediaPlaylist;
        expect(segments).toBeArrayOfSize(2);

        const { parts } = segments[1];
        expect(parts).toBeArrayOfSize(3);

        let offset = 0;
        const length = 20000;
        for (const [index, part] of parts.entries()) {
            expect(part.uri).toBe('fs241.mp4');
            expect(part.byterange).toEqual({ offset, length });
            offset += length;
            if (index < 2) {
                expect(part.duration).toBe(0.2);
                expect(part.independent).toBeTrue();
                expect(part.gap).toBeTrue();
            }
        }
    });
});

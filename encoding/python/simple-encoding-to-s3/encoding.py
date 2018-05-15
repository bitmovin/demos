import datetime

from bitmovin import Bitmovin, Encoding, HTTPSInput, H264CodecConfiguration, \
    AACCodecConfiguration, H264Profile, StreamInput, SelectionMode, Stream, EncodingOutput, ACLEntry, ACLPermission, \
    FMP4Muxing, MuxingStream, CloudRegion, DashManifest, FMP4Representation, FMP4RepresentationType, Period, \
    VideoAdaptationSet, AudioAdaptationSet, S3Output
from bitmovin.errors import BitmovinError

API_KEY = '<YOUR API KEY>'

# https://<INSERT_YOUR_HTTP_HOST>/<INSERT_YOUR_HTTP_PATH>
HTTPS_INPUT_HOST = 'eu-storage.bitcodin.com/'
HTTPS_INPUT_PATH = 'inputs/Sintel.2010.720p.mkv'

S3_OUTPUT_ACCESSKEY = '<INSERT_YOUR_ACCESS_KEY>'
S3_OUTPUT_SECRETKEY = '<INSERT_YOUR_SECRET_KEY>'
S3_OUTPUT_BUCKETNAME = '<INSERT_YOUR_BUCKET_NAME>'

date_component = str(datetime.datetime.now()).replace(' ', '_').replace(':', '-').split('.')[0].replace('_', '__')
OUTPUT_BASE_PATH = 'your/output/base/path/{}/'.format(date_component)

# Please set here the encoding profiles. You can modify height, bitrate and fps.
encoding_profiles = [dict(height=240, bitrate=500, fps=None),
                     dict(height=360, bitrate=800, fps=None),
                     dict(height=480, bitrate=1500, fps=None),
                     dict(height=720, bitrate=4000, fps=None),
                     dict(height=1080, bitrate=6000, fps=None)]


def main():
    bitmovin = Bitmovin(api_key=API_KEY)

    # Create an HTTPs input. This resource is then used as base URL for the input file.
    https_input = HTTPSInput(name='HTTPS input', host=HTTPS_INPUT_HOST)
    https_input = bitmovin.inputs.HTTPS.create(https_input).resource

    # Create an S3 Output. This will be used as target bucket for the muxings, sprites and manifests
    s3_output = S3Output(access_key=S3_OUTPUT_ACCESSKEY,
                         secret_key=S3_OUTPUT_SECRETKEY,
                         bucket_name=S3_OUTPUT_BUCKETNAME,
                         name='S3 Output')
    s3_output = bitmovin.outputs.S3.create(s3_output).resource

    # Create an Encoding. This will run in AWS_EU_WEST_1. This is the base entity used to configure the encoding.
    encoding = Encoding(name='Encoding with Python',
                        cloud_region=CloudRegion.AWS_EU_WEST_1)

    encoding = bitmovin.encodings.Encoding.create(encoding).resource

    encoding_configs = []

    # Iterate over all encoding profiles and create the H264 configuration with the defined height and bitrate.
    for encoding_profile in encoding_profiles:
        encoding_config = dict(profile=encoding_profile)
        codec = H264CodecConfiguration(
            name='H264 Codec {}p {}k Configuration'.format(encoding_profile.get('height'),
                                                           encoding_profile.get('bitrate')),
            bitrate=encoding_profile.get('bitrate') * 1000,
            height=encoding_profile.get('height'),
            rate=encoding_profile.get("fps"),
            profile=H264Profile.HIGH)
        encoding_config['codec'] = bitmovin.codecConfigurations.H264.create(codec).resource
        encoding_configs.append(encoding_config)

    # Also the AAC configuration has to be created, which will be later on used to create the streams.
    audio_codec_configuration = AACCodecConfiguration(name='AAC Codec Configuration',
                                                      bitrate=128000,
                                                      rate=48000)
    audio_codec_configuration = bitmovin.codecConfigurations.AAC.create(audio_codec_configuration).resource

    video_input_stream = StreamInput(input_id=https_input.id,
                                     input_path=HTTPS_INPUT_PATH,
                                     selection_mode=SelectionMode.AUTO)
    audio_input_stream = StreamInput(input_id=https_input.id,
                                     input_path=HTTPS_INPUT_PATH,
                                     selection_mode=SelectionMode.AUTO)

    # With the configurations and the input file streams are now created and muxed later on.
    for encoding_config in encoding_configs:
        encoding_profile = encoding_config.get("profile")
        video_stream = Stream(codec_configuration_id=encoding_config.get("codec").id,
                              input_streams=[video_input_stream],
                              name='Stream {}p_{}k'.format(encoding_profile.get('height'),
                                                           encoding_profile.get('bitrate')))
        encoding_config['stream'] = bitmovin.encodings.Stream.create(object_=video_stream,
                                                                     encoding_id=encoding.id).resource

    audio_stream = Stream(codec_configuration_id=audio_codec_configuration.id,
                          input_streams=[audio_input_stream], name='Audio Stream')
    audio_stream = bitmovin.encodings.Stream.create(object_=audio_stream,
                                                    encoding_id=encoding.id).resource

    acl_entry = ACLEntry(permission=ACLPermission.PUBLIC_READ)

    # Create FMP4 muxings which are later used for the DASH manifest. The current settings will set a segment length
    # of 4 seconds.
    for encoding_config in encoding_configs:
        encoding_profile = encoding_config.get("profile")
        video_muxing_stream = MuxingStream(encoding_config.get("stream").id)
        video_muxing_output = EncodingOutput(output_id=s3_output.id,
                                             output_path=OUTPUT_BASE_PATH + 'video/{}p_{}k/'.format(
                                                 encoding_profile.get('height'),
                                                 encoding_profile.get('bitrate')),
                                             acl=[acl_entry])
        video_muxing = FMP4Muxing(segment_length=4,
                                  segment_naming='seg_%number%.m4s',
                                  init_segment_name='init.mp4',
                                  streams=[video_muxing_stream],
                                  outputs=[video_muxing_output],
                                  name='FMP4 Muxing {}p_{}k'.format(encoding_profile.get('height'),
                                                                    encoding_profile.get('bitrate')))
        encoding_config['muxing'] = bitmovin.encodings.Muxing.FMP4.create(object_=video_muxing,
                                                                          encoding_id=encoding.id).resource

    audio_muxing_stream = MuxingStream(audio_stream.id)
    audio_muxing_output = EncodingOutput(output_id=s3_output.id,
                                         output_path=OUTPUT_BASE_PATH + 'audio/',
                                         acl=[acl_entry])
    audio_muxing = FMP4Muxing(segment_length=4,
                              segment_naming='seg_%number%.m4s',
                              init_segment_name='init.mp4',
                              streams=[audio_muxing_stream],
                              outputs=[audio_muxing_output],
                              name='Audio Muxing')
    audio_muxing = bitmovin.encodings.Muxing.FMP4.create(object_=audio_muxing,
                                                         encoding_id=encoding.id).resource

    bitmovin.encodings.Encoding.start(encoding_id=encoding.id)

    try:
        bitmovin.encodings.Encoding.wait_until_finished(encoding_id=encoding.id, check_interval=1)
    except BitmovinError as bitmovin_error:
        print("Exception occurred while waiting for encoding to finish: {}".format(bitmovin_error))

    # Specify the output for manifest which will be in the OUTPUT_BASE_PATH.
    manifest_output = EncodingOutput(output_id=s3_output.id,
                                     output_path=OUTPUT_BASE_PATH,
                                     acl=[acl_entry])
    # Create a DASH manifest and add one period with an adapation set for audio and video
    dash_manifest = DashManifest(manifest_name='stream.mpd',
                                 outputs=[manifest_output],
                                 name='DASH Manifest')
    dash_manifest = bitmovin.manifests.DASH.create(dash_manifest).resource
    period = Period()
    period = bitmovin.manifests.DASH.add_period(object_=period, manifest_id=dash_manifest.id).resource
    video_adaptation_set = VideoAdaptationSet()
    video_adaptation_set = bitmovin.manifests.DASH.add_video_adaptation_set(object_=video_adaptation_set,
                                                                            manifest_id=dash_manifest.id,
                                                                            period_id=period.id).resource
    audio_adaptation_set = AudioAdaptationSet(lang='en')
    audio_adaptation_set = bitmovin.manifests.DASH.add_audio_adaptation_set(object_=audio_adaptation_set,
                                                                            manifest_id=dash_manifest.id,
                                                                            period_id=period.id).resource

    # Add all representation to the video adaption set
    for encoding_config in encoding_configs:
        encoding_profile = encoding_config.get("profile")
        muxing = encoding_config.get('muxing')
        fmp4_representation_1080p = FMP4Representation(FMP4RepresentationType.TEMPLATE,
                                                       encoding_id=encoding.id,
                                                       muxing_id=muxing.id,
                                                       segment_path='video/{}p_{}k/'.format(
                                                           encoding_profile.get('height'),
                                                           encoding_profile.get('bitrate')))
        encoding_config['dash'] = bitmovin.manifests.DASH.add_fmp4_representation(object_=fmp4_representation_1080p,
                                                                                  manifest_id=dash_manifest.id,
                                                                                  period_id=period.id,
                                                                                  adaptationset_id=video_adaptation_set.id
                                                                                  ).resource

    fmp4_representation_audio = FMP4Representation(FMP4RepresentationType.TEMPLATE,
                                                   encoding_id=encoding.id,
                                                   muxing_id=audio_muxing.id,
                                                   segment_path='audio/')
    bitmovin.manifests.DASH.add_fmp4_representation(object_=fmp4_representation_audio,
                                                    manifest_id=dash_manifest.id,
                                                    period_id=period.id,
                                                    adaptationset_id=audio_adaptation_set.id)

    bitmovin.manifests.DASH.start(manifest_id=dash_manifest.id)

    try:
        bitmovin.manifests.DASH.wait_until_finished(manifest_id=dash_manifest.id, check_interval=1)
    except BitmovinError as bitmovin_error:
        print("Exception occurred while waiting for manifest creation to finish: {}".format(bitmovin_error))
        

if __name__ == '__main__':
    main()

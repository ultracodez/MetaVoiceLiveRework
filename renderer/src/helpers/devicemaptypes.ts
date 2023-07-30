export interface DeviceMap {
  inputs: Array<Device>;
  outputs: Array<Device>;
}
export interface Device {
  index: number;
  name: string;
  max_input_channels: number;
  max_output_channels: number;
  default_sample_rate: number;
  is_default_input: boolean;
  is_default_output: boolean;
}
export default DeviceMap;

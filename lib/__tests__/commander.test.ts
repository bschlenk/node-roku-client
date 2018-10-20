import Client from '../client';
import Commander from '../commander';
import * as keys from '../keys';

describe('Commander', () => {
  let methods: any[];
  let client: Client;
  let commander: Commander;

  beforeEach(() => {
    methods = [];
    client = new Client('address');
    client.keypress = function (command) {
      methods.push(command);
      return Promise.resolve();
    };
    commander = new Commander(client);
  });

  it('should allow chaining methods', () =>
    commander
      .up(2)
      .down(2)
      .left()
      .right()
      .left()
      .right()
      .text('b')
      .text('a')
      .enter()
      .send()
      .then(() => {
        expect(methods).toEqual([
          'Up',
          'Up',
          'Down',
          'Down',
          'Left',
          'Right',
          'Left',
          'Right',
          'b',
          'a',
          'Enter',
        ]);
      }));

  it('should allow for key strings to be used', () =>
    commander
      .keypress(keys.VOLUME_DOWN)
      .keypress(keys.VOLUME_UP)
      .keypress(keys.VOLUME_MUTE)
      .keypress('Power')
      .send()
      .then(() => {
        expect(methods).toEqual([
          'VolumeDown',
          'VolumeUp',
          'VolumeMute',
          'Power',
        ]);
      }));

  it('should allow commands to be added in the exec method', () =>
    commander
      .exec(cmd => cmd.down())
      .up()
      .send()
      .then(() => {
        expect(methods).toEqual(['Down', 'Up']);
      }));
});

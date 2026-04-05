import { Button } from 'heroui-native/button';
import { ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View className="flex-1 items-center gap-6 p-8 pt-20">
        <Text className="text-4xl font-bold text-foreground">Hello World</Text>

        <View className="w-full gap-3">
          <Button variant="primary" onPress={() => alert('Primary!')}>
            Primary
          </Button>

          <Button variant="secondary" onPress={() => alert('Secondary!')}>
            Secondary
          </Button>

          <Button variant="tertiary" onPress={() => alert('Tertiary!')}>
            Tertiary
          </Button>

          <Button variant="outline" onPress={() => alert('Outline!')}>
            Outline
          </Button>

          <Button variant="ghost" onPress={() => alert('Ghost!')}>
            Ghost
          </Button>

          <Button variant="danger" onPress={() => alert('Danger!')}>
            Danger
          </Button>

          <Button isDisabled>Disabled</Button>
        </View>
      </View>
    </ScrollView>
  );
}

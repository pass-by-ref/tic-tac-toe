import { StyleProp, ViewStyle, Pressable, StyleSheet, View, Text } from 'react-native';

export type Team = "X" | "O";
export type Choice = Team | null;

export interface BoardProps {
  style: StyleProp<ViewStyle>;
  state: Choice[][]; // 3x3 grid of choices
  onPress: (row: number, col: number) => void;
}

export const Board = (props: BoardProps) => {
  interface RowProps {
    style?: StyleProp<ViewStyle>
    children: React.ReactElement<SpaceProps>[];
  }
  const Row = (props: RowProps) => {
    return (
      <View style={[styles.row, props.style]}>
        {props.children}
      </View>
    )
  }

  interface SpaceProps {
    value: Choice;
    position: [number, number]; // [row, col]
    onPress: (row: number, col: number) => void;
  }
  const Space = (props: SpaceProps) => {
    const [x,y] = props.position;
    return (
      <Pressable onPress={() => props.onPress(x, y)}>
        <View style={styles.space}>
          <Text style={styles.icon}>{props.value}</Text>
        </View>
      </Pressable>
    )
  }

  return (
    <View style={[styles.container, props.style]}>
      <Row>
        <Space position={[0,0]} value={props.state[0][0]} onPress={props.onPress} />
        <Space position={[0,1]} value={props.state[0][1]} onPress={props.onPress} />
        <Space position={[0,2]} value={props.state[0][2]} onPress={props.onPress} />
      </Row>
      <Row>
        <Space position={[1,0]} value={props.state[1][0]} onPress={props.onPress} />
        <Space position={[1,1]} value={props.state[1][1]} onPress={props.onPress} />
        <Space position={[1,2]} value={props.state[1][2]} onPress={props.onPress} />
      </Row>
      <Row>
        <Space position={[2,0]} value={props.state[2][0]} onPress={props.onPress} />
        <Space position={[2,1]} value={props.state[2][1]} onPress={props.onPress} />
        <Space position={[2,2]} value={props.state[2][2]} onPress={props.onPress}/>
      </Row>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { minWidth: "50%" },
  row: {flexDirection:"row", justifyContent: "center", alignItems: "center", width: "100%"},
  space: { width: 100, height: 100, backgroundColor: "pink", borderColor: "black", borderWidth: 1, justifyContent: "center", alignItems: "center" },
  icon: { fontSize: 24, fontWeight: "bold" }
});

export default Board;
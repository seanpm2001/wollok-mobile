import React, { useState } from 'react'
import { FAB, Portal, Provider, withTheme } from 'react-native-paper'
import { Theme } from '../../theme'
import { OneOrMany } from '../../utils/type-helpers'

type Action = React.ComponentProps<typeof FAB.Group>['actions'][number]

function MultiFabScreen(props: {
  theme: Theme
  children: OneOrMany<Element>
  actions: Action[]
}) {
  const [open, setOpen] = useState(false)
  const theme = props.theme

  return (
    <Provider theme={theme}>
      <Portal>
        {props.children}
        <FAB.Group
          theme={{
            ...theme,
            colors: {
              ...theme.colors,
              text: '#000',
            },
          }}
          icon="plus"
          fabStyle={{ backgroundColor: theme.colors.primary }}
          actions={props.actions.map(addStyleToAction)}
          open={open}
          visible={true}
          onStateChange={({ open }) => setOpen(open)}
        />
      </Portal>
    </Provider>
  )

  function addStyleToAction(action: Action): Action {
    return {
      ...action,
      style: {
        backgroundColor: theme.colors.primary,
      },
    }
  }
}

export default withTheme(MultiFabScreen)

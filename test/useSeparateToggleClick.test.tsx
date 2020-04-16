import * as React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react'
import { useSeparateToggleClick, ShouldToggleClick, ShouldToggleNonClick, ToggleReason } from '../src/useSeparateToggleClick';
import { TreeView, TreeItem} from '@material-ui/lab'

describe('useSeparateToggleClick', () => {
  let wrappedClicked = false;
  beforeEach(()=>{
    jest.resetAllMocks();
    wrappedClicked = false;
  })
  interface TestUseSeparateToggleClickProps{
    initiallyExpanded?:string[],
   
    shouldToggleClick:ShouldToggleClick,
    shouldToggleNonClick?:ShouldToggleNonClick
  }
  const TestComponent:React.FC<TestUseSeparateToggleClickProps> = (props) => {
    const {expanded, onNodeToggle, IconWrapper} = useSeparateToggleClick(props.shouldToggleClick,props.initiallyExpanded, props.shouldToggleNonClick);
    return (
      // will demo default icons and own icons
      <TreeView defaultParentIcon={<IconWrapper><div data-testid="defaultparenticon" /></IconWrapper>}
        onNodeToggle={onNodeToggle} 
        expanded={expanded}
        >
          <TreeItem label="parent" nodeId="parent" data-testid="parent">
            <TreeItem nodeId="child" data-testid="child" />
          </TreeItem>
          <TreeItem icon={<IconWrapper><div onClick={()=>wrappedClicked=true} data-testid="parenticon2" /></IconWrapper>} label="parent2" nodeId="parent2" data-testid="parent2">
            <TreeItem nodeId="child2" data-testid="child2" />
          </TreeItem>
      </TreeView>
    )
  }
  const shouldToggleClick = jest.fn();
  const shouldToggleNonClick = jest.fn()

  function expectNotExpanded(renderResult:RenderResult){
    expect(renderResult.queryByTestId('child')).toBeNull();
    expect(renderResult.queryByTestId('child2')).toBeNull();
  }
  function expectShouldChangeExpanded(renderResult:RenderResult,changeExpanded:()=>void){
    expectNotExpanded(renderResult);
    changeExpanded();
    expect(renderResult.queryByTestId('child')).toBeDefined();
    expect(renderResult.queryByTestId('child2')).toBeNull();
  }
  function expectShouldNotChangeExpanded(renderResult:RenderResult,changeExpanded:()=>void){
    expectNotExpanded(renderResult);
    changeExpanded();
    expect(renderResult.queryByTestId('child')).toBeDefined();
    expect(renderResult.queryByTestId('child2')).toBeNull();
  }
  describe('click', () => {
    let renderResult:RenderResult
    beforeEach(()=>{
      (renderResult as any) = undefined;
    })
    function labelClick(){
      fireEvent.click(renderResult.getByText('parent'));
    }
    function renderShouldToggleClick(){
      renderResult = render(<TestComponent shouldToggleClick={shouldToggleClick} />);
    }
    function renderAndlabelClick(){
      renderShouldToggleClick();
      labelClick();
    }

    function renderAndIconClick(iconId:string){
      const {getByTestId} = render(<TestComponent shouldToggleClick={shouldToggleClick} />);
      fireEvent.click(getByTestId(iconId));
    }

    function expectIconClick(iconClick:boolean){
      expect(shouldToggleClick.mock.calls[0][0]).toBe(iconClick);
    }

    function expectExpanding(expanding:boolean,call=0){
      expect(shouldToggleClick.mock.calls[call][1]).toBe(expanding);
    }
    
    it('should wrap existing icon onClick', () => {
      renderAndIconClick('parenticon2');
      expect(wrappedClicked).toBe(true);
    })

    it('should work with initially expanded', () => {
      const renderResult = render(<TestComponent shouldToggleClick={shouldToggleClick} initiallyExpanded={['parent']} />);
      expect(renderResult.queryByTestId('child')).toBeDefined();
      expect(renderResult.queryByTestId('child2')).toBeNull();
    });

    it('should not call shouldToggleNonClick', () => {
      renderAndlabelClick();
      expect(shouldToggleNonClick).not.toHaveBeenCalled();
    })

    describe('should call shouldToggleClick', () => {
      describe('iconClick argument', () => {

        it('should have iconClick true for a wrapped icon click', () => {
          renderAndIconClick('defaultparenticon');
          expectIconClick(true);
        })
    
        it('should have iconClick true for any wrapped icon click', () => {
          renderAndIconClick('parenticon2');
          expectIconClick(true);
        })
        
        it('should have iconClick false for a label click', () => {
          renderAndlabelClick();
          expectIconClick(false);
        })

      })
      
      describe('isExpanding argument', () => {

        it('should have isExpanding true if expanding', () => {
          renderAndlabelClick();
          expectExpanding(true);
        })
  
        it('should have isExpanding false if collapsing', () => {
          shouldToggleClick.mockReturnValue(true);
          renderAndlabelClick();
          labelClick();
          expectExpanding(false,1);
        })
      })

      describe('return value', () => {

        it('should change expanded if return true', () => {
          shouldToggleClick.mockReturnValue(true);
          renderShouldToggleClick();
          expectShouldChangeExpanded(renderResult, labelClick);

        })
  
        it('should not change expanded if return false', () => {
          shouldToggleClick.mockReturnValue(false);
          renderShouldToggleClick();
          expectShouldNotChangeExpanded(renderResult, labelClick);
        })
      })

    })

  })

  describe('keyboard event', () => {
    describe('shouldToggleNonClick', () => {
      let renderResult:RenderResult
      beforeEach(()=>{
        (renderResult as any) = undefined;
      })
      function renderShouldToggleNonClick(){
        renderResult = render(<TestComponent shouldToggleNonClick={shouldToggleNonClick} shouldToggleClick={shouldToggleClick} />);
      }
      function expand(firstParent:boolean){
        renderResult.getByTestId(firstParent?'parent':'parent2').focus();
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
      }
      function renderAndExpand(firstParent:boolean){
        renderShouldToggleNonClick();
        expand(firstParent);
      }
      function renderAndCollapse(){
        shouldToggleNonClick.mockReturnValue(true);
        const {getByTestId} = render(<TestComponent shouldToggleNonClick={shouldToggleNonClick} shouldToggleClick={shouldToggleClick} />);
        getByTestId('parent').focus();
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' });
      }
      function renderNoChange(){
        shouldToggleNonClick.mockReturnValue(true);
        const {getByTestId} = render(<TestComponent shouldToggleNonClick={shouldToggleNonClick} shouldToggleClick={shouldToggleClick} />);
        getByTestId('parent').focus();
        fireEvent.keyDown(document.activeElement!, { key: '*' });
        fireEvent.keyDown(document.activeElement!, { key: '*' });
      }
      describe('reason argument', () => {
        function expectReason(reason:ToggleReason, call=0){
          expect(shouldToggleNonClick.mock.calls[call][0]).toBe(reason);
        }
        
        it('should be expand when expand', () => {
          shouldToggleNonClick.mockReturnValue(true);
          renderAndExpand(true);
          expectReason('expand');
        })
        it('should be collapse when collapse', () => {
          renderAndCollapse();
          expectReason('collapse',1);
        })
        it('should be no change when no change', () => {
          renderNoChange();
          expectReason('nochange',1);
        })
      })
      describe('newOrRemoved argument', () => {
        
        function expectNewOrRemoved(expected:string[],call=0){
          expect(shouldToggleNonClick.mock.calls[call][1]).toEqual(expected);
        }

        function expectExpandedNew(firstParent:boolean,expected:string[]){
          shouldToggleNonClick.mockReturnValue(true);
          renderAndExpand(firstParent);
          expectNewOrRemoved(expected);
        }

        it('should have new when expand', () => {
          expectExpandedNew(true,['parent']);
        })

        it('should have new when expand a different parent', () => {
          expectExpandedNew(false,['parent2']);
        })

        it('should have removed when collapse', () => {
          renderAndCollapse();
          expectNewOrRemoved(['parent'],1);
        })

        it('should be empty when no change', () => {
          renderNoChange();
          expectNewOrRemoved([],1);
        })

        describe('return value', () => {
          it('should toggle if return true', () => {
            shouldToggleNonClick.mockReturnValue(true);
            renderShouldToggleNonClick();
            expectShouldChangeExpanded(renderResult,()=>expand(true));

          })
          it('should not toggle if return false', () => {
            shouldToggleNonClick.mockReturnValue(false);
            renderShouldToggleNonClick();
            expectShouldNotChangeExpanded(renderResult,()=>expand(true));
          })
          
          it('should set expanded to return value if return an array', () => {
            shouldToggleNonClick.mockReturnValue(['parent2']);
            renderAndExpand(true);
            expect(renderResult.queryByTestId('child')).toBeNull();
            expect(renderResult.queryByTestId('child2')).toBeDefined();
          })
        })
      })
    })
    it('should not call shouldToggleClick', () => {
      const {getByTestId} = render(<TestComponent shouldToggleClick={shouldToggleClick} />);
      getByTestId('parent').focus();
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
      expect(shouldToggleClick).not.toHaveBeenCalled();
    });

  })
});

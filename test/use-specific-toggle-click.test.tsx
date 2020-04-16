import {useIconToggleClick} from '../src/useIconToggleClick';
import {useLabelToggleClick} from '../src/useLabelToggleClick';
import {useSeparateToggleClick, ShouldToggleNonClick, UsedSeparateToggleClick} from '../src/useSeparateToggleClick'
jest.mock('../src/useSeparateToggleClick');

interface UseSpecificTest{
  specific:typeof useLabelToggleClick|typeof useLabelToggleClick,
  isLabel:boolean
}
const useSpecificTests:UseSpecificTest[] = [
  {
    isLabel:true,
    specific:useLabelToggleClick
  },
  {
    isLabel:false,
    specific:useIconToggleClick
  }
]
useSpecificTests.forEach(specificTest => {
  describe(`use${specificTest.isLabel?'Label':'Icon'}ToggleClick`, () => {
    const initialExpanded:string[] = [];
    const shouldToggleNonClick:ShouldToggleNonClick = () => true;
    const mockUseSeparateToggleClickReturn = {};

    const mockUseSeparateToggleClick = useSeparateToggleClick as jest.Mock;
    let usedSpecificToggleClick:UsedSeparateToggleClick;
    let args:Parameters<typeof useSeparateToggleClick>

    beforeEach(()=>{
      mockUseSeparateToggleClick.mockClear();

      mockUseSeparateToggleClick.mockReturnValue(mockUseSeparateToggleClickReturn);
      usedSpecificToggleClick = specificTest.specific(initialExpanded, shouldToggleNonClick);
      args = mockUseSeparateToggleClick.mock.calls[0];
    })

    it('should pass arguments to useSeparateToggleClick', () => {
      expect(args[1]).toBe(initialExpanded);
      expect(args[2]).toBe(shouldToggleNonClick);
      expect(usedSpecificToggleClick).toBe(mockUseSeparateToggleClickReturn);
    })

    describe('shouldToggleClick', () => {
      const labelClickResult = specificTest.isLabel?true:false
      it(`should return ${!labelClickResult} for icon click`, () => {
        const shouldToggleClick = args[0];
        expect(shouldToggleClick(true,false)).toBe(!labelClickResult);
      })

      it(`should return ${labelClickResult} for label click`, () => {
        const shouldToggleClick = args[0];
        expect(shouldToggleClick(false,false)).toBe(labelClickResult);
      })
    })
  })
})


using System;

public static class FarmEventManager
{
    // 어떤 타겟으로 줌할지 정의하는 열거형(enum)
    public enum ViewTarget
    {
        Fan,
        Water,
        Sensor
    }

    // ViewTarget 정보를 담아 이벤트를 보낼 Action
    public static event Action<ViewTarget> OnViewTargetRequested;

    // 이벤트를 발생시키는 메서드
    public static void RequestViewChange(ViewTarget target)
    {
        OnViewTargetRequested?.Invoke(target);
    }
}
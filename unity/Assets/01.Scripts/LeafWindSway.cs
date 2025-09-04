using UnityEngine;
using System.Collections.Generic;
using System.Linq;

public class LeafWindSway : MonoBehaviour
{
    public float swayStrength = 0.05f;
    public float swaySpeed = 1.0f;

    // 흔들리게 할 자식 오브젝트들의 이름을 담을 리스트
    public List<string> targetChildNames = new List<string>();

    // 실제 흔들릴 자식 오브젝트들의 Transform을 담아둘 리스트
    private List<SwayObject> swayObjects = new List<SwayObject>();

    // 흔들림 계산을 위한 간단한 클래스
    private class SwayObject
    {
        public Transform transform;
        public Quaternion startRotation;
    }

    void Start()
    {
        // 모든 자식 오브젝트의 Transform을 가져옴 (비활성화된 것도 포함)
        Transform[] allChildren = GetComponentsInChildren<Transform>(true);

        foreach (Transform child in allChildren)
        {
            // 자식의 이름이 타겟 리스트에 포함되어 있다면
            if (targetChildNames.Contains(child.name))
            {
                // 흔들릴 오브젝트 리스트에 추가
                swayObjects.Add(new SwayObject
                {
                    transform = child,
                    startRotation = child.localRotation
                });
            }
        }
    }

    void Update()
    {
        // 게임 시작 시 찾아둔 오브젝트들만 반복해서 흔들어줌
        foreach (SwayObject obj in swayObjects)
        {
            float sway = Mathf.Sin(Time.time * swaySpeed) * swayStrength;
            obj.transform.localRotation = obj.startRotation * Quaternion.Euler(0, 0, sway);
        }
    }
}
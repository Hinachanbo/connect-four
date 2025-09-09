import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export default function Header() {
  const [showRules, setShowRules] = useState(false);
  return (
    <div className="header d-flex justify-content-between align-items-center p-3" style={{ backgroundColor: "lightgrey" }}>
      <h1>Connect Four</h1>
      <Button variant="info" onClick={() => setShowRules(true)}>ルール説明</Button>

      <Modal show={showRules} onHide={() => setShowRules(false)} centered>
        <Modal.Header>
          <Modal.Title>ルール</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            <li>列の一番下に駒を置くことができます。</li>
            <li>縦・横・斜めに4つ以上並べたプレイヤーの勝ちです。</li>
            <li>盤面が埋まった場合は引き分けです。</li>
            <li>あなたは先攻で赤色、一姫は後攻で黄色です。</li>
          </ul>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRules(false)}>閉じる</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
